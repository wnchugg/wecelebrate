/**
 * Automation API Service
 * Handles scheduled emails, webhooks, and triggered actions
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getAccessToken } from '../lib/apiClient';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

// Get auth headers with environment ID
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  const env = getCurrentEnvironment();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-Access-Token': token,
    'X-Environment-ID': env.id,
    'Content-Type': 'application/json',
  };
}

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
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
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
  context: Record<string, unknown>;
  error?: string;
}

// ==================== AUTOMATION RULES ====================

export async function fetchAutomationRules(siteId: string): Promise<AutomationRule[]> {
  const response = await fetch(`${API_BASE}/automation-rules?siteId=${siteId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch automation rules');
  }

  const data = await response.json() as { rules?: AutomationRule[] };
  return data.rules || [];
}

export async function createAutomationRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutomationRule> {
  const response = await fetch(`${API_BASE}/automation-rules`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(rule),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to create automation rule');
  }

  const data = await response.json() as { rule: AutomationRule };
  return data.rule;
}

export async function updateAutomationRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
  const response = await fetch(`${API_BASE}/automation-rules/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to update automation rule');
  }

  const data = await response.json() as { rule: AutomationRule };
  return data.rule;
}

export async function deleteAutomationRule(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/automation-rules/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to delete automation rule');
  }
}

// ==================== EMAIL EVENTS ====================

export async function triggerEmailEvent(params: {
  siteId: string;
  trigger: string;
  context: {
    recipientEmail: string;
    variables: Record<string, string>;
    [key: string]: unknown;
  };
}): Promise<{
  success: boolean;
  rulesMatched: number;
  emailsSent: number;
  emailResults: unknown[];
}> {
  const response = await fetch(`${API_BASE}/email-events/trigger`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to trigger email event');
  }

  return response.json() as Promise<{
    success: boolean;
    rulesMatched: number;
    emailsSent: number;
    emailResults: unknown[];
  }>;
}

// ==================== EMAIL HISTORY ====================

export async function fetchEmailHistory(siteId: string, limit: number = 50): Promise<{
  history: EmailHistory[];
  total: number;
  showing: number;
}> {
  const response = await fetch(`${API_BASE}/email-history?siteId=${siteId}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch email history');
  }

  return response.json() as Promise<{
    history: EmailHistory[];
    total: number;
    showing: number;
  }>;
}