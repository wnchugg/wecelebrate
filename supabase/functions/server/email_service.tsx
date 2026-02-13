/**
 * Email Service using Resend API
 * Handles all transactional email sending for JALA 2 platform
 */

import * as kv from './kv_store.tsx';

interface EmailTemplate {
  id: string;
  name: string;
  subjectLine: string;
  preheaderText?: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  status: string;
}

interface SendEmailParams {
  to: string | string[];
  templateId: string;
  variables: Record<string, string>;
  environmentId?: string;
  from?: string;
  replyTo?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'JALA 2 Platform <onboarding@resend.dev>'; // Change to your verified domain

/**
 * Replace template variables with actual values
 */
function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  });
  
  return result;
}

/**
 * Send email using Resend API
 */
async function sendViaResend(params: {
  to: string | string[];
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailResponse> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return {
      success: false,
      error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.'
    };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from,
        to: Array.isArray(params.to) ? params.to : [params.to],
        reply_to: params.replyTo,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send email'
      };
    }

    console.log('Email sent successfully:', data.id);
    return {
      success: true,
      messageId: data.id
    };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error sending email'
    };
  }
}

/**
 * Send email using template
 */
export async function sendTemplateEmail(params: SendEmailParams): Promise<EmailResponse> {
  const environmentId = params.environmentId || 'development';
  
  try {
    // Get template from KV store
    const template = await kv.get(`email-template:${params.templateId}`, environmentId) as EmailTemplate | null;
    
    if (!template) {
      return {
        success: false,
        error: `Template not found: ${params.templateId}`
      };
    }

    if (template.status !== 'active') {
      return {
        success: false,
        error: `Template is not active: ${params.templateId}`
      };
    }

    // Replace variables in subject, HTML, and text
    const subject = replaceVariables(template.subjectLine, params.variables);
    const html = replaceVariables(template.htmlContent, params.variables);
    const text = replaceVariables(template.textContent, params.variables);

    // Send via Resend
    const result = await sendViaResend({
      to: params.to,
      from: params.from || DEFAULT_FROM,
      replyTo: params.replyTo,
      subject,
      html,
      text,
    });

    // Update usage count if successful
    if (result.success && template) {
      const updatedTemplate = {
        ...template,
        usageCount: (template.usageCount || 0) + 1,
        lastSent: new Date().toISOString()
      };
      await kv.set(`email-template:${params.templateId}`, updatedTemplate, environmentId);
    }

    return result;
  } catch (error: any) {
    console.error('Send template email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send template email'
    };
  }
}

/**
 * Send magic link email
 */
export async function sendMagicLinkEmail(params: {
  to: string;
  userName: string;
  siteName: string;
  magicLink: string;
  expiryDate: string;
  supportEmail?: string;
  environmentId?: string;
}): Promise<EmailResponse> {
  return sendTemplateEmail({
    to: params.to,
    templateId: 'magic-link',
    variables: {
      userName: params.userName,
      siteName: params.siteName,
      magicLink: params.magicLink,
      expiryDate: params.expiryDate,
      supportEmail: params.supportEmail || 'support@jala2.com',
    },
    environmentId: params.environmentId,
  });
}

/**
 * Send access granted email
 */
export async function sendAccessGrantedEmail(params: {
  to: string;
  userName: string;
  siteName: string;
  companyName: string;
  expiryDate: string;
  magicLink: string;
  environmentId?: string;
}): Promise<EmailResponse> {
  return sendTemplateEmail({
    to: params.to,
    templateId: 'access-granted',
    variables: {
      userName: params.userName,
      siteName: params.siteName,
      companyName: params.companyName,
      expiryDate: params.expiryDate,
      magicLink: params.magicLink,
    },
    environmentId: params.environmentId,
  });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(params: {
  to: string;
  userName: string;
  orderNumber: string;
  giftName: string;
  orderTotal: string;
  companyName: string;
  environmentId?: string;
}): Promise<EmailResponse> {
  return sendTemplateEmail({
    to: params.to,
    templateId: 'order-confirmation',
    variables: {
      userName: params.userName,
      orderNumber: params.orderNumber,
      giftName: params.giftName,
      orderTotal: params.orderTotal,
      companyName: params.companyName,
    },
    environmentId: params.environmentId,
  });
}

/**
 * Send shipping notification email
 */
export async function sendShippingNotificationEmail(params: {
  to: string;
  userName: string;
  orderNumber: string;
  giftName: string;
  trackingNumber: string;
  companyName: string;
  environmentId?: string;
}): Promise<EmailResponse> {
  return sendTemplateEmail({
    to: params.to,
    templateId: 'shipping-notification',
    variables: {
      userName: params.userName,
      orderNumber: params.orderNumber,
      giftName: params.giftName,
      trackingNumber: params.trackingNumber,
      companyName: params.companyName,
    },
    environmentId: params.environmentId,
  });
}

/**
 * Send delivery confirmation email
 */
export async function sendDeliveryConfirmationEmail(params: {
  to: string;
  userName: string;
  giftName: string;
  companyName: string;
  environmentId?: string;
}): Promise<EmailResponse> {
  return sendTemplateEmail({
    to: params.to,
    templateId: 'delivery-confirmation',
    variables: {
      userName: params.userName,
      giftName: params.giftName,
      companyName: params.companyName,
    },
    environmentId: params.environmentId,
  });
}

/**
 * Send gift selection reminder email
 */
export async function sendSelectionReminderEmail(params: {
  to: string;
  userName: string;
  siteName: string;
  expiryDate: string;
  companyName: string;
  magicLink: string;
  environmentId?: string;
}): Promise<EmailResponse> {
  return sendTemplateEmail({
    to: params.to,
    templateId: 'selection-reminder',
    variables: {
      userName: params.userName,
      siteName: params.siteName,
      expiryDate: params.expiryDate,
      companyName: params.companyName,
      magicLink: params.magicLink,
    },
    environmentId: params.environmentId,
  });
}

/**
 * Send bulk emails (with rate limiting)
 */
export async function sendBulkEmails(params: {
  emails: SendEmailParams[];
  delayMs?: number;
  environmentId?: string;
}): Promise<{ success: number; failed: number; errors: string[] }> {
  const delay = params.delayMs || 100; // 100ms between emails to avoid rate limits
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const emailParams of params.emails) {
    const result = await sendTemplateEmail({
      ...emailParams,
      environmentId: params.environmentId || emailParams.environmentId
    });

    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push(`${emailParams.to}: ${result.error}`);
    }

    // Rate limiting delay
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return results;
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get email service status
 */
export function getEmailServiceStatus(): {
  configured: boolean;
  provider: string;
  defaultFrom: string;
} {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  
  return {
    configured: !!apiKey,
    provider: 'Resend',
    defaultFrom: DEFAULT_FROM
  };
}
