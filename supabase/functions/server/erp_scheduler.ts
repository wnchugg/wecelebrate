/**
 * ERP Scheduler Module
 * Handles cron-like scheduling for automated ERP syncs
 */

import * as kv from './kv_store.tsx';
import * as erp from './erp_integration.ts';

export interface SyncSchedule {
  id: string;
  erpConnectionId: string;
  name: string;
  enabled: boolean;
  syncType: 'products' | 'inventory' | 'both';
  
  // Cron-like scheduling
  schedule: {
    type: 'cron' | 'interval';
    
    // For cron type
    cronExpression?: string; // e.g., "0 */6 * * *" (every 6 hours)
    timezone?: string; // e.g., "America/New_York"
    
    // For interval type (simpler)
    intervalMinutes?: number; // e.g., 360 for every 6 hours
  };
  
  lastRun?: string; // ISO timestamp
  nextRun?: string; // ISO timestamp
  runCount: number;
  
  // Notification settings
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    emailRecipients?: string[];
  };
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ScheduleExecutionLog {
  id: string;
  scheduleId: string;
  erpConnectionId: string;
  syncType: string;
  status: 'success' | 'failed' | 'partial';
  startedAt: string;
  completedAt: string;
  recordsProcessed: number;
  recordsFailed: number;
  error?: string;
  details?: any;
}

const SCHEDULE_PREFIX = 'erp_schedule:';
const EXECUTION_LOG_PREFIX = 'schedule_execution:';

/**
 * Parse cron expression and calculate next run time
 * Simplified cron parser supporting: minute hour day month dayOfWeek
 */
export function parseNextRun(cronExpression: string, timezone: string = 'UTC'): Date {
  const now = new Date();
  const parts = cronExpression.split(' ');
  
  if (parts.length !== 5) {
    throw new Error('Invalid cron expression. Format: minute hour day month dayOfWeek');
  }
  
  const [minute, hour, day, month, dayOfWeek] = parts;
  
  // Simple parser - supports numeric values and */n syntax
  const parseField = (field: string, max: number): number[] => {
    if (field === '*') {
      return Array.from({ length: max }, (_, i) => i);
    }
    if (field.startsWith('*/')) {
      const step = parseInt(field.substring(2));
      return Array.from({ length: Math.ceil(max / step) }, (_, i) => i * step).filter(v => v < max);
    }
    if (field.includes(',')) {
      return field.split(',').map(v => parseInt(v));
    }
    return [parseInt(field)];
  };
  
  const validMinutes = parseField(minute, 60);
  const validHours = parseField(hour, 24);
  const validDays = day === '*' ? Array.from({ length: 31 }, (_, i) => i + 1) : [parseInt(day)];
  const validMonths = month === '*' ? Array.from({ length: 12 }, (_, i) => i + 1) : [parseInt(month)];
  
  // Find next valid time
  const next = new Date(now);
  next.setSeconds(0);
  next.setMilliseconds(0);
  
  // Start from next minute
  next.setMinutes(next.getMinutes() + 1);
  
  // Find next matching time (brute force up to 7 days ahead)
  const maxAttempts = 7 * 24 * 60; // 7 days in minutes
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const m = next.getMinutes();
    const h = next.getHours();
    const d = next.getDate();
    const mo = next.getMonth() + 1;
    
    if (
      validMinutes.includes(m) &&
      validHours.includes(h) &&
      validDays.includes(d) &&
      validMonths.includes(mo)
    ) {
      return next;
    }
    
    next.setMinutes(next.getMinutes() + 1);
    attempts++;
  }
  
  // Fallback: return 24 hours from now
  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Calculate next run time for interval-based schedule
 */
export function calculateIntervalNextRun(intervalMinutes: number, lastRun?: string): Date {
  const base = lastRun ? new Date(lastRun) : new Date();
  return new Date(base.getTime() + intervalMinutes * 60 * 1000);
}

/**
 * Create a new schedule
 */
export async function createSchedule(schedule: Omit<SyncSchedule, 'id' | 'createdAt' | 'updatedAt' | 'runCount' | 'lastRun' | 'nextRun'>): Promise<SyncSchedule> {
  const id = `schedule_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();
  
  // Calculate next run time
  let nextRun: string;
  if (schedule.schedule.type === 'cron' && schedule.schedule.cronExpression) {
    const next = parseNextRun(schedule.schedule.cronExpression, schedule.schedule.timezone);
    nextRun = next.toISOString();
  } else if (schedule.schedule.type === 'interval' && schedule.schedule.intervalMinutes) {
    const next = calculateIntervalNextRun(schedule.schedule.intervalMinutes);
    nextRun = next.toISOString();
  } else {
    throw new Error('Invalid schedule configuration');
  }
  
  const newSchedule: SyncSchedule = {
    ...schedule,
    id,
    createdAt: now,
    updatedAt: now,
    runCount: 0,
    nextRun,
  };

  await kv.set(`${SCHEDULE_PREFIX}${id}`, newSchedule);
  return newSchedule;
}

/**
 * Get all schedules
 */
export async function getAllSchedules(): Promise<SyncSchedule[]> {
  const schedules = await kv.getByPrefix(SCHEDULE_PREFIX);
  return schedules.map(item => item.value as SyncSchedule);
}

/**
 * Get schedules for a specific ERP connection
 */
export async function getSchedulesByConnection(erpConnectionId: string): Promise<SyncSchedule[]> {
  const allSchedules = await getAllSchedules();
  return allSchedules.filter(s => s.erpConnectionId === erpConnectionId);
}

/**
 * Get schedule by ID
 */
export async function getSchedule(id: string): Promise<SyncSchedule | null> {
  const schedule = await kv.get(`${SCHEDULE_PREFIX}${id}`);
  return schedule as SyncSchedule | null;
}

/**
 * Update schedule
 */
export async function updateSchedule(id: string, updates: Partial<SyncSchedule>): Promise<SyncSchedule | null> {
  const existing = await getSchedule(id);
  if (!existing) return null;

  const updated: SyncSchedule = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  // Recalculate next run if schedule config changed
  if (updates.schedule) {
    if (updated.schedule.type === 'cron' && updated.schedule.cronExpression) {
      const next = parseNextRun(updated.schedule.cronExpression, updated.schedule.timezone);
      updated.nextRun = next.toISOString();
    } else if (updated.schedule.type === 'interval' && updated.schedule.intervalMinutes) {
      const next = calculateIntervalNextRun(updated.schedule.intervalMinutes, updated.lastRun);
      updated.nextRun = next.toISOString();
    }
  }

  await kv.set(`${SCHEDULE_PREFIX}${id}`, updated);
  return updated;
}

/**
 * Delete schedule
 */
export async function deleteSchedule(id: string): Promise<boolean> {
  await kv.del(`${SCHEDULE_PREFIX}${id}`);
  return true;
}

/**
 * Execute a scheduled sync
 */
export async function executeScheduledSync(scheduleId: string): Promise<ScheduleExecutionLog> {
  const schedule = await getSchedule(scheduleId);
  if (!schedule) {
    throw new Error('Schedule not found');
  }

  const startedAt = new Date().toISOString();
  let status: 'success' | 'failed' | 'partial' = 'success';
  let recordsProcessed = 0;
  let recordsFailed = 0;
  let error: string | undefined;
  let details: any = {};

  try {
    // Execute product sync if needed
    if (schedule.syncType === 'products' || schedule.syncType === 'both') {
      const productResult = await erp.syncProductsFromERP(schedule.erpConnectionId);
      if (productResult.success) {
        recordsProcessed += productResult.products?.length || 0;
        details.products = { count: productResult.products?.length || 0 };
      } else {
        status = 'partial';
        error = productResult.error;
        details.products = { error: productResult.error };
      }
    }

    // Execute inventory sync if needed
    if (schedule.syncType === 'inventory' || schedule.syncType === 'both') {
      const inventoryResult = await erp.syncInventoryFromERP(schedule.erpConnectionId);
      if (inventoryResult.success) {
        recordsProcessed += inventoryResult.inventory?.length || 0;
        details.inventory = { count: inventoryResult.inventory?.length || 0 };
      } else {
        status = status === 'success' ? 'partial' : 'failed';
        error = error ? `${error}; ${inventoryResult.error}` : inventoryResult.error;
        details.inventory = { error: inventoryResult.error };
      }
    }

    if (recordsProcessed === 0 && !error) {
      status = 'failed';
      error = 'No records processed';
    }

  } catch (err: any) {
    status = 'failed';
    error = err.message;
  }

  const completedAt = new Date().toISOString();

  // Create execution log
  const logId = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const executionLog: ScheduleExecutionLog = {
    id: logId,
    scheduleId,
    erpConnectionId: schedule.erpConnectionId,
    syncType: schedule.syncType,
    status,
    startedAt,
    completedAt,
    recordsProcessed,
    recordsFailed,
    error,
    details,
  };

  await kv.set(`${EXECUTION_LOG_PREFIX}${logId}`, executionLog);

  // Update schedule with last run and calculate next run
  const now = new Date();
  let nextRun: string;
  
  if (schedule.schedule.type === 'cron' && schedule.schedule.cronExpression) {
    const next = parseNextRun(schedule.schedule.cronExpression, schedule.schedule.timezone);
    nextRun = next.toISOString();
  } else if (schedule.schedule.type === 'interval' && schedule.schedule.intervalMinutes) {
    const next = calculateIntervalNextRun(schedule.schedule.intervalMinutes, completedAt);
    nextRun = next.toISOString();
  } else {
    nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }

  await updateSchedule(scheduleId, {
    lastRun: completedAt,
    nextRun,
    runCount: schedule.runCount + 1,
  });

  return executionLog;
}

/**
 * Get schedules that are due to run
 */
export async function getDueSchedules(): Promise<SyncSchedule[]> {
  const allSchedules = await getAllSchedules();
  const now = new Date();
  
  return allSchedules.filter(schedule => {
    if (!schedule.enabled) return false;
    if (!schedule.nextRun) return false;
    
    const nextRunDate = new Date(schedule.nextRun);
    return nextRunDate <= now;
  });
}

/**
 * Process all due schedules
 */
export async function processDueSchedules(): Promise<ScheduleExecutionLog[]> {
  const dueSchedules = await getDueSchedules();
  console.log(`Processing ${dueSchedules.length} due schedules`);
  
  const logs: ScheduleExecutionLog[] = [];
  
  for (const schedule of dueSchedules) {
    try {
      console.log(`Executing schedule: ${schedule.name} (${schedule.id})`);
      const log = await executeScheduledSync(schedule.id);
      logs.push(log);
      console.log(`Schedule execution completed: ${log.status}`);
    } catch (error: any) {
      console.error(`Failed to execute schedule ${schedule.id}:`, error);
    }
  }
  
  return logs;
}

/**
 * Get execution logs for a schedule
 */
export async function getExecutionLogs(scheduleId: string, limit: number = 50): Promise<ScheduleExecutionLog[]> {
  const allLogs = await kv.getByPrefix(EXECUTION_LOG_PREFIX);
  return allLogs
    .map(item => item.value as ScheduleExecutionLog)
    .filter(log => log.scheduleId === scheduleId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}

/**
 * Validate cron expression
 */
export function validateCronExpression(expression: string): { valid: boolean; error?: string } {
  try {
    const parts = expression.split(' ');
    
    if (parts.length !== 5) {
      return { valid: false, error: 'Cron expression must have 5 parts: minute hour day month dayOfWeek' };
    }
    
    const [minute, hour, day, month, dayOfWeek] = parts;
    
    // Basic validation
    const validatePart = (part: string, min: number, max: number): boolean => {
      if (part === '*') return true;
      if (part.startsWith('*/')) {
        const step = parseInt(part.substring(2));
        return !isNaN(step) && step > 0 && step <= max;
      }
      if (part.includes(',')) {
        return part.split(',').every(v => {
          const num = parseInt(v);
          return !isNaN(num) && num >= min && num <= max;
        });
      }
      const num = parseInt(part);
      return !isNaN(num) && num >= min && num <= max;
    };
    
    if (!validatePart(minute, 0, 59)) {
      return { valid: false, error: 'Invalid minute field (0-59)' };
    }
    if (!validatePart(hour, 0, 23)) {
      return { valid: false, error: 'Invalid hour field (0-23)' };
    }
    if (!validatePart(day, 1, 31)) {
      return { valid: false, error: 'Invalid day field (1-31)' };
    }
    if (!validatePart(month, 1, 12)) {
      return { valid: false, error: 'Invalid month field (1-12)' };
    }
    if (!validatePart(dayOfWeek, 0, 6)) {
      return { valid: false, error: 'Invalid day of week field (0-6, where 0=Sunday)' };
    }
    
    // Try to calculate next run to ensure it's parseable
    parseNextRun(expression);
    
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Get human-readable description of cron expression
 */
export function describeCronExpression(expression: string): string {
  const parts = expression.split(' ');
  if (parts.length !== 5) return 'Invalid expression';
  
  const [minute, hour, day, month, dayOfWeek] = parts;
  
  // Handle common patterns
  if (expression === '0 0 * * *') return 'Daily at midnight';
  if (expression === '0 12 * * *') return 'Daily at noon';
  if (expression === '0 */6 * * *') return 'Every 6 hours';
  if (expression === '0 */12 * * *') return 'Every 12 hours';
  if (expression === '*/30 * * * *') return 'Every 30 minutes';
  if (expression === '0 0 * * 0') return 'Weekly on Sunday at midnight';
  if (expression === '0 0 1 * *') return 'Monthly on the 1st at midnight';
  
  // Generic description
  let desc = 'At ';
  
  if (minute === '*') desc += 'every minute';
  else if (minute.startsWith('*/')) desc += `every ${minute.substring(2)} minutes`;
  else desc += `minute ${minute}`;
  
  desc += ' of ';
  
  if (hour === '*') desc += 'every hour';
  else if (hour.startsWith('*/')) desc += `every ${hour.substring(2)} hours`;
  else desc += `hour ${hour}`;
  
  if (day !== '*') desc += ` on day ${day}`;
  if (month !== '*') desc += ` in month ${month}`;
  
  return desc;
}