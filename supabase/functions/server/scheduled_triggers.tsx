/**
 * Scheduled Triggers System
 * Handles time-based email automation triggers:
 * - selection_expiring: Reminds employees before gift selection deadline
 * - anniversary_approaching: Notifies employees before service anniversary
 */

import * as kv from './kv_store.tsx';
import * as emailEventHelper from './email_event_helper.tsx';

/**
 * Configuration for scheduled trigger checks
 */
export interface ScheduledTriggerConfig {
  id: string;
  siteId: string;
  trigger: 'selection_expiring' | 'anniversary_approaching';
  enabled: boolean;
  
  // For selection_expiring
  reminderDays?: number[]; // e.g., [7, 3, 1] - remind 7, 3, and 1 days before expiry
  
  // For anniversary_approaching
  anniversaryReminderDays?: number[]; // e.g., [30, 7] - remind 30 and 7 days before
  
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Result of processing scheduled triggers
 */
export interface ScheduledTriggerResult {
  trigger: string;
  siteId: string;
  processed: number;
  sent: number;
  failed: number;
  errors: string[];
}

/**
 * Check for employees with expiring gift selections
 */
export async function processSelectionExpiringTriggers(
  environmentId: string = 'development'
): Promise<ScheduledTriggerResult[]> {
  const results: ScheduledTriggerResult[] = [];
  
  try {
    // Get all sites
    const sites = await kv.getByPrefix('site:', environmentId);
    
    for (const site of sites) {
      // Skip if no expiry date or site is not live
      if (!site.expiryDate || site.status !== 'live') {
        continue;
      }
      
      const result: ScheduledTriggerResult = {
        trigger: 'selection_expiring',
        siteId: site.id,
        processed: 0,
        sent: 0,
        failed: 0,
        errors: [],
      };
      
      try {
        // Get reminder configuration (default: 7, 3, 1 days)
        const reminderDays = [7, 3, 1];
        
        // Parse expiry date
        const expiryDate = new Date(site.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if we should send reminders today
        if (!reminderDays.includes(daysUntilExpiry)) {
          continue;
        }
        
        // Get all employees for this site
        const employees = await kv.getByPrefix(`employee:${site.id}:`, environmentId);
        
        // Filter employees who haven't selected a gift yet
        const employeesWithoutSelection = [];
        
        for (const employee of employees) {
          if (employee.status !== 'active' || !employee.email || !employee.serialCard) {
            continue;
          }
          
          // Check if employee has placed an order
          const orders = await kv.getByPrefix(`order:${site.id}:`, environmentId);
          const hasOrder = orders.some(order => 
            order.employeeEmail === employee.email || order.employeeId === employee.id
          );
          
          if (!hasOrder) {
            employeesWithoutSelection.push(employee);
          }
        }
        
        result.processed = employeesWithoutSelection.length;
        
        // Get client info
        const client = await kv.get(`client:${site.clientId}`, environmentId);
        
        // Send reminders
        for (const employee of employeesWithoutSelection) {
          try {
            const sent = await emailEventHelper.notifySelectionExpiring(
              site.id,
              {
                email: employee.email,
                name: employee.name || 'Employee',
                serialCode: employee.serialCard,
              },
              {
                name: site.name || 'Your Site',
                expiryDate: expiryDate.toLocaleDateString(),
              },
              daysUntilExpiry,
              environmentId
            );
            
            if (sent) {
              result.sent++;
            } else {
              result.failed++;
            }
          } catch (error: any) {
            result.failed++;
            result.errors.push(`${employee.email}: ${error.message}`);
          }
        }
        
        console.log(
          `[Selection Expiring] Site ${site.id}: ${result.sent}/${result.processed} sent, ${result.failed} failed, ${daysUntilExpiry} days remaining`
        );
      } catch (siteError: any) {
        result.errors.push(`Site processing error: ${siteError.message}`);
        console.error(`[Selection Expiring] Site ${site.id} error:`, siteError);
      }
      
      results.push(result);
    }
  } catch (error: any) {
    console.error('[Selection Expiring] Global error:', error);
  }
  
  return results;
}

/**
 * Check for employees with upcoming service anniversaries
 */
export async function processAnniversaryApproachingTriggers(
  environmentId: string = 'development'
): Promise<ScheduledTriggerResult[]> {
  const results: ScheduledTriggerResult[] = [];
  
  try {
    // Get all sites
    const sites = await kv.getByPrefix('site:', environmentId);
    
    for (const site of sites) {
      // Skip if site is not for anniversaries (you might have a flag for this)
      if (site.type !== 'anniversary' && site.purpose !== 'anniversary') {
        continue;
      }
      
      const result: ScheduledTriggerResult = {
        trigger: 'anniversary_approaching',
        siteId: site.id,
        processed: 0,
        sent: 0,
        failed: 0,
        errors: [],
      };
      
      try {
        // Get reminder configuration (default: 30, 7 days before)
        const reminderDays = [30, 7];
        
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // Get all employees for this site
        const employees = await kv.getByPrefix(`employee:${site.id}:`, environmentId);
        
        // Filter employees with upcoming anniversaries
        const employeesWithUpcomingAnniversary = [];
        
        for (const employee of employees) {
          if (employee.status !== 'active' || !employee.email) {
            continue;
          }
          
          // Check if employee has anniversary data
          if (!employee.hireDate && !employee.anniversaryDate) {
            continue;
          }
          
          // Calculate anniversary date
          let anniversaryDate: Date;
          let yearsOfService = 0;
          
          if (employee.anniversaryDate) {
            anniversaryDate = new Date(employee.anniversaryDate);
          } else if (employee.hireDate) {
            const hireDate = new Date(employee.hireDate);
            yearsOfService = currentYear - hireDate.getFullYear();
            anniversaryDate = new Date(currentYear, hireDate.getMonth(), hireDate.getDate());
          } else {
            continue;
          }
          
          // Check if anniversary date has passed this year
          if (anniversaryDate < now) {
            // Move to next year
            anniversaryDate.setFullYear(currentYear + 1);
            yearsOfService++;
          }
          
          const daysUntilAnniversary = Math.ceil(
            (anniversaryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          // Check if we should send reminder today
          if (reminderDays.includes(daysUntilAnniversary)) {
            employeesWithUpcomingAnniversary.push({
              ...employee,
              anniversaryDate: anniversaryDate.toISOString(),
              yearsOfService,
              daysUntilAnniversary,
            });
          }
        }
        
        result.processed = employeesWithUpcomingAnniversary.length;
        
        // Send reminders
        for (const employee of employeesWithUpcomingAnniversary) {
          try {
            const sent = await emailEventHelper.notifyAnniversaryApproaching(
              site.id,
              {
                email: employee.email,
                name: employee.name || 'Employee',
                anniversaryDate: new Date(employee.anniversaryDate).toLocaleDateString(),
                yearsOfService: employee.yearsOfService,
              },
              environmentId
            );
            
            if (sent) {
              result.sent++;
            } else {
              result.failed++;
            }
          } catch (error: any) {
            result.failed++;
            result.errors.push(`${employee.email}: ${error.message}`);
          }
        }
        
        console.log(
          `[Anniversary Approaching] Site ${site.id}: ${result.sent}/${result.processed} sent, ${result.failed} failed`
        );
      } catch (siteError: any) {
        result.errors.push(`Site processing error: ${siteError.message}`);
        console.error(`[Anniversary Approaching] Site ${site.id} error:`, siteError);
      }
      
      results.push(result);
    }
  } catch (error: any) {
    console.error('[Anniversary Approaching] Global error:', error);
  }
  
  return results;
}

/**
 * Process all scheduled triggers
 * This should be called by a cron job daily
 */
export async function processAllScheduledTriggers(
  environmentId: string = 'development'
): Promise<{
  success: boolean;
  selectionExpiring: ScheduledTriggerResult[];
  anniversaryApproaching: ScheduledTriggerResult[];
  totalSent: number;
  totalFailed: number;
  processedAt: string;
}> {
  const startTime = Date.now();
  console.log('[Scheduled Triggers] Starting daily processing...');
  
  const selectionExpiring = await processSelectionExpiringTriggers(environmentId);
  const anniversaryApproaching = await processAnniversaryApproachingTriggers(environmentId);
  
  const totalSent = 
    selectionExpiring.reduce((sum, r) => sum + r.sent, 0) +
    anniversaryApproaching.reduce((sum, r) => sum + r.sent, 0);
  
  const totalFailed = 
    selectionExpiring.reduce((sum, r) => sum + r.failed, 0) +
    anniversaryApproaching.reduce((sum, r) => sum + r.failed, 0);
  
  const duration = Date.now() - startTime;
  
  console.log(
    `[Scheduled Triggers] Completed in ${duration}ms: ${totalSent} sent, ${totalFailed} failed`
  );
  
  // Store execution log
  const logEntry = {
    id: `scheduled-trigger-log-${Date.now()}`,
    processedAt: new Date().toISOString(),
    selectionExpiring,
    anniversaryApproaching,
    totalSent,
    totalFailed,
    duration,
  };
  
  await kv.set(`scheduled-trigger-log:${logEntry.id}`, logEntry, environmentId);
  
  return {
    success: true,
    selectionExpiring,
    anniversaryApproaching,
    totalSent,
    totalFailed,
    processedAt: logEntry.processedAt,
  };
}

/**
 * Get recent scheduled trigger logs
 */
export async function getScheduledTriggerLogs(
  environmentId: string = 'development',
  limit: number = 10
): Promise<any[]> {
  const logs = await kv.getByPrefix('scheduled-trigger-log:', environmentId);
  
  // Sort by processedAt descending
  logs.sort((a, b) => {
    const dateA = new Date(a.processedAt || 0).getTime();
    const dateB = new Date(b.processedAt || 0).getTime();
    return dateB - dateA;
  });
  
  return logs.slice(0, limit);
}

/**
 * Get scheduled trigger statistics
 */
export async function getScheduledTriggerStats(
  environmentId: string = 'development'
): Promise<{
  last24Hours: { sent: number; failed: number };
  last7Days: { sent: number; failed: number };
  last30Days: { sent: number; failed: number };
}> {
  const logs = await kv.getByPrefix('scheduled-trigger-log:', environmentId);
  
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  const stats = {
    last24Hours: { sent: 0, failed: 0 },
    last7Days: { sent: 0, failed: 0 },
    last30Days: { sent: 0, failed: 0 },
  };
  
  logs.forEach(log => {
    const logTime = new Date(log.processedAt).getTime();
    const age = now - logTime;
    
    if (age <= day) {
      stats.last24Hours.sent += log.totalSent || 0;
      stats.last24Hours.failed += log.totalFailed || 0;
    }
    
    if (age <= 7 * day) {
      stats.last7Days.sent += log.totalSent || 0;
      stats.last7Days.failed += log.totalFailed || 0;
    }
    
    if (age <= 30 * day) {
      stats.last30Days.sent += log.totalSent || 0;
      stats.last30Days.failed += log.totalFailed || 0;
    }
  });
  
  return stats;
}
