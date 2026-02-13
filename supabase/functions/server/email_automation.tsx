/**
 * Email Automation System
 * Handles automation rules, event triggers, and email history
 */

import * as kv from './kv_store.tsx';

export interface AutomationRule {
  id: string;
  siteId: string;
  name: string;
  description: string;
  templateId: string;
  trigger: 'employee_added' | 'gift_selected' | 'order_placed' | 'order_shipped' | 'order_delivered' | 'selection_expiring' | 'anniversary_approaching';
  enabled: boolean;
  conditions?: {
    daysBeforeExpiry?: number;
    daysBeforeAnniversary?: number;
    timeOfDay?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface EmailEvent {
  siteId: string;
  trigger: string;
  context: {
    recipientEmail: string;
    variables: Record<string, string>;
    [key: string]: any;
  };
}

export interface EmailHistory {
  id: string;
  siteId: string;
  templateId: string;
  ruleId: string;
  trigger: string;
  recipientEmail: string;
  subject: string;
  messageId: string;
  status: 'sent' | 'failed' | 'bounced';
  sentAt: string;
  context: any;
  error?: string;
}

/**
 * Get automation rules for a site
 */
export async function getAutomationRules(siteId: string, environmentId: string): Promise<AutomationRule[]> {
  const rules = await kv.getByPrefix(`automation-rule:${siteId}:`, environmentId);
  rules.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return rules;
}

/**
 * Get a single automation rule
 */
export async function getAutomationRule(ruleId: string, environmentId: string): Promise<AutomationRule | null> {
  // Need to search by prefix since we don't know siteId
  const allRules = await kv.getByPrefix('automation-rule:', environmentId);
  return allRules.find(r => r.id === ruleId) || null;
}

/**
 * Create automation rule
 */
export async function createAutomationRule(
  rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string,
  environmentId: string
): Promise<AutomationRule> {
  const newRule: AutomationRule = {
    ...rule,
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const key = `automation-rule:${newRule.siteId}:${newRule.id}`;
  await kv.set(key, newRule, environmentId);
  
  return newRule;
}

/**
 * Update automation rule
 */
export async function updateAutomationRule(
  ruleId: string,
  updates: Partial<AutomationRule>,
  userId: string,
  environmentId: string
): Promise<AutomationRule | null> {
  const existingRule = await getAutomationRule(ruleId, environmentId);
  
  if (!existingRule) {
    return null;
  }
  
  const updated: AutomationRule = {
    ...existingRule,
    ...updates,
    id: existingRule.id,
    siteId: existingRule.siteId,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  };
  
  const key = `automation-rule:${updated.siteId}:${updated.id}`;
  await kv.set(key, updated, environmentId);
  
  return updated;
}

/**
 * Delete automation rule
 */
export async function deleteAutomationRule(ruleId: string, environmentId: string): Promise<boolean> {
  const rule = await getAutomationRule(ruleId, environmentId);
  
  if (!rule) {
    return false;
  }
  
  const key = `automation-rule:${rule.siteId}:${ruleId}`;
  await kv.del(key, environmentId);
  
  return true;
}

/**
 * Replace variables in template content
 */
function replaceVariables(content: string, vars: Record<string, string>): string {
  let result = content;
  if (vars) {
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value || '');
    });
  }
  return result;
}

/**
 * Trigger email event - this is the main function called when an event occurs
 */
export async function triggerEmailEvent(
  event: EmailEvent,
  environmentId: string
): Promise<{
  success: boolean;
  rulesMatched: number;
  emailsSent: number;
  emailResults: any[];
}> {
  const { siteId, trigger, context } = event;
  
  console.log(`[Email Automation] Trigger: ${trigger} for site: ${siteId}`);
  
  // Get all automation rules for this site
  const allRules = await kv.getByPrefix(`automation-rule:${siteId}:`, environmentId);
  const matchingRules = allRules.filter(rule => 
    rule.enabled && rule.trigger === trigger
  );
  
  console.log(`[Email Automation] Found ${matchingRules.length} matching rules`);
  
  if (matchingRules.length === 0) {
    return {
      success: true,
      rulesMatched: 0,
      emailsSent: 0,
      emailResults: [],
    };
  }
  
  const emailResults = [];
  
  for (const rule of matchingRules) {
    try {
      // Get the site template
      const template = await kv.get(`site-template:${rule.templateId}`, environmentId);
      
      if (!template || !template.enabled) {
        console.log(`[Email Automation] Template ${rule.templateId} not found or disabled`);
        continue;
      }
      
      // Prepare email variables from context
      const variables = context?.variables || {};
      
      const subject = replaceVariables(template.subject, variables);
      const htmlContent = replaceVariables(template.htmlContent, variables);
      const textContent = replaceVariables(template.textContent, variables);
      
      // Send email if email is enabled
      if (template.emailEnabled && context?.recipientEmail) {
        const apiKey = Deno.env.get('RESEND_API_KEY');
        
        if (apiKey) {
          try {
            const resendResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'WeCelebrate <onboarding@resend.dev>',
                to: [context.recipientEmail],
                subject: subject,
                html: htmlContent,
                text: textContent,
              }),
            });
            
            if (resendResponse.ok) {
              const resendData = await resendResponse.json();
              
              // Log email send history
              const historyEntry: EmailHistory = {
                id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                siteId,
                templateId: rule.templateId,
                ruleId: rule.id,
                trigger,
                recipientEmail: context.recipientEmail,
                subject,
                messageId: resendData.id,
                status: 'sent',
                sentAt: new Date().toISOString(),
                context,
              };
              
              await kv.set(`email-history:${siteId}:${historyEntry.id}`, historyEntry, environmentId);
              
              emailResults.push({
                ruleId: rule.id,
                ruleName: rule.name,
                templateId: rule.templateId,
                templateName: template.name,
                success: true,
                messageId: resendData.id,
              });
              
              console.log(`[Email Automation] Email sent successfully: ${resendData.id}`);
            } else {
              const errorData = await resendResponse.json();
              console.error(`[Email Automation] Failed to send email:`, errorData);
              
              // Log failed email
              const historyEntry: EmailHistory = {
                id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                siteId,
                templateId: rule.templateId,
                ruleId: rule.id,
                trigger,
                recipientEmail: context.recipientEmail,
                subject,
                messageId: '',
                status: 'failed',
                sentAt: new Date().toISOString(),
                context,
                error: errorData.message,
              };
              
              await kv.set(`email-history:${siteId}:${historyEntry.id}`, historyEntry, environmentId);
              
              emailResults.push({
                ruleId: rule.id,
                ruleName: rule.name,
                templateId: rule.templateId,
                templateName: template.name,
                success: false,
                error: errorData.message,
              });
            }
          } catch (fetchError: any) {
            console.error(`[Email Automation] Network error sending email:`, fetchError);
            emailResults.push({
              ruleId: rule.id,
              ruleName: rule.name,
              success: false,
              error: fetchError.message,
            });
          }
        } else {
          console.error('[Email Automation] RESEND_API_KEY not configured');
          emailResults.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: false,
            error: 'Email service not configured',
          });
        }
      }
      
    } catch (ruleError: any) {
      console.error(`[Email Automation] Error processing rule ${rule.id}:`, ruleError);
      emailResults.push({
        ruleId: rule.id,
        success: false,
        error: ruleError.message,
      });
    }
  }
  
  return {
    success: true,
    rulesMatched: matchingRules.length,
    emailsSent: emailResults.filter(r => r.success).length,
    emailResults,
  };
}

/**
 * Get email send history
 */
export async function getEmailHistory(
  siteId: string,
  environmentId: string,
  limit: number = 50
): Promise<{ history: EmailHistory[]; total: number; showing: number }> {
  const history = await kv.getByPrefix(`email-history:${siteId}:`, environmentId);
  
  // Sort by sentAt descending (most recent first)
  history.sort((a, b) => {
    const dateA = new Date(a.sentAt || 0).getTime();
    const dateB = new Date(b.sentAt || 0).getTime();
    return dateB - dateA;
  });
  
  const limitedHistory = history.slice(0, limit);
  
  return {
    history: limitedHistory,
    total: history.length,
    showing: limitedHistory.length,
  };
}
