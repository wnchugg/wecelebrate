/**
 * Scheduled Email System
 * Handles email scheduling and delayed delivery
 */

import * as kv from './kv_store.tsx';
import * as emailEventHelper from './email_event_helper.tsx';
import type { TriggerType } from './email_event_helper.tsx';

/**
 * Scheduled email configuration
 */
export interface ScheduledEmail {
  id: string;
  siteId: string;
  trigger: TriggerType;
  context: {
    recipientEmail: string;
    variables: Record<string, string>;
    [key: string]: any;
  };
  scheduledFor: string; // ISO date string
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
  sentAt?: string;
  error?: string;
  createdBy: string;
}

/**
 * Create a scheduled email
 */
export async function scheduleEmail(
  email: Omit<ScheduledEmail, 'id' | 'createdAt' | 'status'>,
  environmentId: string = 'development'
): Promise<ScheduledEmail> {
  const scheduled: ScheduledEmail = {
    ...email,
    id: `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  await kv.set(
    `scheduled-email:${scheduled.siteId}:${scheduled.id}`,
    scheduled,
    environmentId
  );
  
  console.log(`[Scheduled Email] Created: ${scheduled.id} for ${scheduled.scheduledFor}`);
  
  return scheduled;
}

/**
 * Get scheduled emails for a site
 */
export async function getScheduledEmails(
  siteId: string,
  environmentId: string = 'development',
  status?: 'pending' | 'sent' | 'failed' | 'cancelled'
): Promise<ScheduledEmail[]> {
  const emails = await kv.getByPrefix(`scheduled-email:${siteId}:`, environmentId);
  
  let filtered = emails;
  if (status) {
    filtered = emails.filter(e => e.status === status);
  }
  
  // Sort by scheduledFor ascending
  filtered.sort((a, b) => {
    const dateA = new Date(a.scheduledFor).getTime();
    const dateB = new Date(b.scheduledFor).getTime();
    return dateA - dateB;
  });
  
  return filtered;
}

/**
 * Cancel a scheduled email
 */
export async function cancelScheduledEmail(
  emailId: string,
  environmentId: string = 'development'
): Promise<boolean> {
  // Find email
  const allEmails = await kv.getByPrefix('scheduled-email:', environmentId);
  const email = allEmails.find(e => e.id === emailId);
  
  if (!email || email.status !== 'pending') {
    return false;
  }
  
  const updated: ScheduledEmail = {
    ...email,
    status: 'cancelled',
  };
  
  await kv.set(
    `scheduled-email:${email.siteId}:${emailId}`,
    updated,
    environmentId
  );
  
  console.log(`[Scheduled Email] Cancelled: ${emailId}`);
  
  return true;
}

/**
 * Process due scheduled emails
 * This should be called periodically (e.g., every minute)
 */
export async function processDueEmails(
  environmentId: string = 'development'
): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const now = new Date();
  const allEmails = await kv.getByPrefix('scheduled-email:', environmentId);
  
  // Filter pending emails that are due
  const dueEmails = allEmails.filter(email => {
    if (email.status !== 'pending') return false;
    
    const scheduledDate = new Date(email.scheduledFor);
    return scheduledDate <= now;
  });
  
  console.log(`[Scheduled Email] Processing ${dueEmails.length} due emails`);
  
  let sent = 0;
  let failed = 0;
  
  for (const email of dueEmails) {
    try {
      // Trigger the email event
      const result = await emailEventHelper.triggerEvent(
        email.siteId,
        email.trigger,
        email.context,
        environmentId
      );
      
      if (result) {
        // Mark as sent
        const updated: ScheduledEmail = {
          ...email,
          status: 'sent',
          sentAt: new Date().toISOString(),
        };
        
        await kv.set(
          `scheduled-email:${email.siteId}:${email.id}`,
          updated,
          environmentId
        );
        
        sent++;
        console.log(`[Scheduled Email] Sent: ${email.id}`);
      } else {
        // Mark as failed (no automation rules matched)
        const updated: ScheduledEmail = {
          ...email,
          status: 'failed',
          error: 'No automation rules matched',
          sentAt: new Date().toISOString(),
        };
        
        await kv.set(
          `scheduled-email:${email.siteId}:${email.id}`,
          updated,
          environmentId
        );
        
        failed++;
        console.error(`[Scheduled Email] Failed (no rules): ${email.id}`);
      }
    } catch (error: any) {
      // Mark as failed with error
      const updated: ScheduledEmail = {
        ...email,
        status: 'failed',
        error: error.message,
        sentAt: new Date().toISOString(),
      };
      
      await kv.set(
        `scheduled-email:${email.siteId}:${email.id}`,
        updated,
        environmentId
      );
      
      failed++;
      console.error(`[Scheduled Email] Failed: ${email.id}:`, error);
    }
  }
  
  return {
    processed: dueEmails.length,
    sent,
    failed,
  };
}

/**
 * Get scheduled email statistics for a site
 */
export async function getScheduledEmailStats(
  siteId: string,
  environmentId: string = 'development'
): Promise<{
  pending: number;
  sent: number;
  failed: number;
  cancelled: number;
  total: number;
}> {
  const emails = await kv.getByPrefix(`scheduled-email:${siteId}:`, environmentId);
  
  return {
    pending: emails.filter(e => e.status === 'pending').length,
    sent: emails.filter(e => e.status === 'sent').length,
    failed: emails.filter(e => e.status === 'failed').length,
    cancelled: emails.filter(e => e.status === 'cancelled').length,
    total: emails.length,
  };
}
