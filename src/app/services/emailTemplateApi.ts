/**
 * Email Template API Service
 * Handles all operations related to email templates (global and site-specific)
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { GlobalTemplate, SiteTemplate } from '../types/emailTemplates';
import { getAccessToken } from '../lib/apiClient';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

// Get auth headers with environment ID
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-Access-Token': token,
    'Content-Type': 'application/json',
  };
}

// ==================== GLOBAL TEMPLATES ====================

export async function fetchGlobalTemplates(): Promise<GlobalTemplate[]> {
  const response = await fetch(`${API_BASE}/global-templates`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch global templates');
  }

  const data = await response.json() as { templates?: GlobalTemplate[] };
  return data.templates || [];
}

export async function fetchGlobalTemplateById(id: string): Promise<GlobalTemplate> {
  const response = await fetch(`${API_BASE}/global-templates/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch global template');
  }

  const data = await response.json() as { template: GlobalTemplate };
  return data.template;
}

export async function createGlobalTemplate(template: Omit<GlobalTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<GlobalTemplate> {
  const response = await fetch(`${API_BASE}/global-templates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(template),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to create global template');
  }

  const data = await response.json() as { template: GlobalTemplate };
  return data.template;
}

export async function updateGlobalTemplate(id: string, updates: Partial<GlobalTemplate>): Promise<GlobalTemplate> {
  const response = await fetch(`${API_BASE}/global-templates/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to update global template');
  }

  const data = await response.json() as { template: GlobalTemplate };
  return data.template;
}

export async function deleteGlobalTemplate(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/global-templates/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to delete global template');
  }
}

// ==================== SITE TEMPLATES ====================

export async function fetchSiteTemplates(): Promise<SiteTemplate[]> {
  const response = await fetch(`${API_BASE}/site-templates`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch site templates');
  }

  const data = await response.json() as { templates?: SiteTemplate[] };
  return data.templates || [];
}

export async function fetchSiteTemplatesBySite(siteId: string): Promise<SiteTemplate[]> {
  const response = await fetch(`${API_BASE}/site-templates?siteId=${siteId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch site templates');
  }

  const data = await response.json() as { templates?: SiteTemplate[] };
  return data.templates || [];
}

export async function fetchSiteTemplateById(id: string): Promise<SiteTemplate> {
  const response = await fetch(`${API_BASE}/site-templates/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch site template');
  }

  const data = await response.json() as { template: SiteTemplate };
  return data.template;
}

export async function createSiteTemplate(template: Omit<SiteTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<SiteTemplate> {
  const response = await fetch(`${API_BASE}/site-templates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(template),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to create site template');
  }

  const data = await response.json() as { template: SiteTemplate };
  return data.template;
}

export async function updateSiteTemplate(id: string, updates: Partial<SiteTemplate>): Promise<SiteTemplate> {
  const response = await fetch(`${API_BASE}/site-templates/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to update site template');
  }

  const data = await response.json() as { template: SiteTemplate };
  return data.template;
}

export async function deleteSiteTemplate(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/site-templates/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to delete site template');
  }
}

// ==================== UTILITY FUNCTIONS ====================

export async function sendTestEmail(
  templateId: string,
  email: string,
  variables?: Record<string, string>
): Promise<{ success: boolean; messageId?: string; message?: string }> {
  const response = await fetch(`${API_BASE}/site-templates/${templateId}/test`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, variables }),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to send test email');
  }

  return response.json() as Promise<{ success: boolean; messageId?: string; message?: string }>;
}

export async function getEmailServiceStatus(): Promise<{
  configured: boolean;
  provider: string;
  defaultFrom: string;
}> {
  const response = await fetch(`${API_BASE}/email-service/status`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to get email service status');
  }

  return response.json() as Promise<{
    configured: boolean;
    provider: string;
    defaultFrom: string;
  }>;
}

export async function seedGlobalTemplates(): Promise<{ success: boolean; count: number }> {
  const response = await fetch(`${API_BASE}/global-templates/seed`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to seed global templates');
  }

  return response.json() as Promise<{ success: boolean; count: number }>;
}