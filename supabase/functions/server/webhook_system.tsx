/**
 * Webhook System for External Integrations
 * Allows external systems to trigger email automation events
 */

import * as kv from './kv_store.tsx';
import * as emailEventHelper from './email_event_helper.tsx';
import type { TriggerType } from './email_event_helper.tsx';

/**
 * Webhook configuration stored per site
 */
export interface WebhookConfig {
  id: string;
  siteId: string;
  name: string;
  url: string;
  secret: string; // For signature verification
  events: TriggerType[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Webhook delivery log
 */
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  siteId: string;
  event: string;
  payload: any;
  status: 'success' | 'failed';
  statusCode?: number;
  response?: any;
  error?: string;
  attemptedAt: string;
  duration?: number;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Use HMAC SHA256 for signature verification
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(payload);
  
  // Note: In production, use proper crypto library
  // For now, we'll do simple comparison
  const expectedSignature = `sha256=${secret}`;
  
  return signature === expectedSignature;
}

/**
 * Process incoming webhook
 */
export async function processIncomingWebhook(
  siteId: string,
  event: TriggerType,
  payload: {
    recipientEmail: string;
    variables: Record<string, string>;
    [key: string]: any;
  },
  environmentId: string = 'development'
): Promise<{
  success: boolean;
  message: string;
  emailsSent?: number;
}> {
  console.log(`[Webhook] Processing ${event} for site ${siteId}`);
  
  try {
    // Trigger the email event
    const result = await emailEventHelper.triggerEvent(
      siteId,
      event,
      payload,
      environmentId
    );
    
    return {
      success: true,
      message: `Webhook processed successfully`,
      emailsSent: result ? 1 : 0,
    };
  } catch (error: any) {
    console.error('[Webhook] Processing error:', error);
    return {
      success: false,
      message: error.message || 'Webhook processing failed',
    };
  }
}

/**
 * Send outgoing webhook notification
 */
export async function sendWebhookNotification(
  webhook: WebhookConfig,
  event: string,
  payload: any,
  environmentId: string = 'development'
): Promise<WebhookDelivery> {
  const startTime = Date.now();
  const delivery: WebhookDelivery = {
    id: `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    webhookId: webhook.id,
    siteId: webhook.siteId,
    event,
    payload,
    status: 'failed',
    attemptedAt: new Date().toISOString(),
  };
  
  try {
    // Prepare webhook payload
    const webhookPayload = {
      event,
      siteId: webhook.siteId,
      timestamp: new Date().toISOString(),
      data: payload,
    };
    
    const payloadString = JSON.stringify(webhookPayload);
    
    // Generate signature
    const signature = `sha256=${webhook.secret}`;
    
    // Send webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event,
        'User-Agent': 'WeCelebrate-Webhook/1.0',
      },
      body: payloadString,
    });
    
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      const responseData = await response.text();
      delivery.status = 'success';
      delivery.statusCode = response.status;
      delivery.response = responseData;
      delivery.duration = duration;
      
      console.log(`[Webhook] Delivered successfully to ${webhook.url} in ${duration}ms`);
    } else {
      const errorData = await response.text();
      delivery.status = 'failed';
      delivery.statusCode = response.status;
      delivery.error = errorData;
      delivery.duration = duration;
      
      console.error(`[Webhook] Delivery failed to ${webhook.url}: ${response.status}`);
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    delivery.status = 'failed';
    delivery.error = error.message;
    delivery.duration = duration;
    
    console.error('[Webhook] Delivery error:', error);
  }
  
  // Save delivery log
  await kv.set(
    `webhook-delivery:${webhook.siteId}:${delivery.id}`,
    delivery,
    environmentId
  );
  
  return delivery;
}

/**
 * Get webhook configurations for a site
 */
export async function getWebhooks(
  siteId: string,
  environmentId: string = 'development'
): Promise<WebhookConfig[]> {
  const webhooks = await kv.getByPrefix(`webhook:${siteId}:`, environmentId);
  webhooks.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return webhooks;
}

/**
 * Create webhook configuration
 */
export async function createWebhook(
  webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>,
  environmentId: string = 'development'
): Promise<WebhookConfig> {
  const newWebhook: WebhookConfig = {
    ...webhook,
    id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await kv.set(
    `webhook:${newWebhook.siteId}:${newWebhook.id}`,
    newWebhook,
    environmentId
  );
  
  return newWebhook;
}

/**
 * Update webhook configuration
 */
export async function updateWebhook(
  webhookId: string,
  updates: Partial<WebhookConfig>,
  environmentId: string = 'development'
): Promise<WebhookConfig | null> {
  // Find webhook
  const allWebhooks = await kv.getByPrefix('webhook:', environmentId);
  const existing = allWebhooks.find(w => w.id === webhookId);
  
  if (!existing) {
    return null;
  }
  
  const updated: WebhookConfig = {
    ...existing,
    ...updates,
    id: existing.id,
    siteId: existing.siteId,
    updatedAt: new Date().toISOString(),
  };
  
  await kv.set(
    `webhook:${updated.siteId}:${updated.id}`,
    updated,
    environmentId
  );
  
  return updated;
}

/**
 * Delete webhook configuration
 */
export async function deleteWebhook(
  webhookId: string,
  environmentId: string = 'development'
): Promise<boolean> {
  // Find webhook
  const allWebhooks = await kv.getByPrefix('webhook:', environmentId);
  const webhook = allWebhooks.find(w => w.id === webhookId);
  
  if (!webhook) {
    return false;
  }
  
  await kv.del(`webhook:${webhook.siteId}:${webhookId}`, environmentId);
  return true;
}

/**
 * Get webhook delivery history
 */
export async function getWebhookDeliveries(
  siteId: string,
  environmentId: string = 'development',
  limit: number = 50
): Promise<WebhookDelivery[]> {
  const deliveries = await kv.getByPrefix(`webhook-delivery:${siteId}:`, environmentId);
  
  // Sort by attemptedAt descending
  deliveries.sort((a, b) => {
    const dateA = new Date(a.attemptedAt || 0).getTime();
    const dateB = new Date(b.attemptedAt || 0).getTime();
    return dateB - dateA;
  });
  
  return deliveries.slice(0, limit);
}
