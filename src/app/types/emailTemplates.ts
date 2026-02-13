export type EmailTemplateType = 
  | 'invite' 
  | 'order_confirmation' 
  | 'order_cancellation'
  | 'gift_reminder'
  | 'shipping_notification'
  | 'gift_delivered'
  | 'password_reset'
  | 'account_created'
  | 'feedback_request'
  | 'expiration_warning'
  | 'thank_you';

export type NotificationChannel = 'email' | 'push' | 'sms';

export interface GlobalTemplate {
  id: string;
  type: EmailTemplateType;
  name: string;
  description: string;
  category: 'transactional' | 'marketing' | 'system';
  defaultSubject: string;
  defaultHtmlContent: string;
  defaultTextContent: string;
  defaultSmsContent?: string;
  defaultPushTitle?: string;
  defaultPushBody?: string;
  variables: EmailTemplateVariable[];
  isSystem: boolean; // System templates cannot be deleted
  createdAt: string;
  updatedAt: string;
}

export interface SiteTemplate {
  id: string;
  siteId: string;
  globalTemplateId: string; // Reference to the global template
  type: EmailTemplateType;
  name: string;
  // Email channel
  emailEnabled: boolean;
  subject: string;
  htmlContent: string;
  textContent: string;
  // Push notification channel
  pushEnabled: boolean;
  pushTitle?: string;
  pushBody?: string;
  // SMS channel
  smsEnabled: boolean;
  smsContent?: string;
  // Settings
  enabled: boolean;
  gdprSettings?: GDPRSettings;
  reminderSettings?: ReminderSettings;
  createdAt: string;
  updatedAt: string;
}

// Legacy support - alias to SiteTemplate
export type EmailTemplate = SiteTemplate;

export interface EmailTemplateVariable {
  key: string;
  label: string;
  description: string;
  example: string;
}

export interface GDPRSettings {
  includeDataProcessingNotice: boolean;
  includeUnsubscribeLink: boolean;
  includeDataDeletionInstructions: boolean;
  dataRetentionPeriod: string; // e.g., "30 days", "90 days"
  privacyPolicyUrl?: string;
  dataControllerName: string;
  dataControllerEmail: string;
  dataControllerAddress?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  sendAfterDays: number; // Days after invite
  maxReminders: number;
  reminderIntervalDays: number; // Days between reminders
}

// Template variable definitions for each email type
export const inviteVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'site_name', label: 'Site Name', description: 'Name of the gifting site', example: 'TechCorp Employee Gifts 2026' },
  { key: 'site_url', label: 'Site URL', description: 'URL to access the gifting portal', example: 'https://techcorp-gifts.jala.com' },
  { key: 'access_code', label: 'Access Code', description: 'Unique access code for validation', example: 'ABC-123-XYZ' },
  { key: 'expiration_date', label: 'Expiration Date', description: 'When the invite expires', example: 'March 31, 2026' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export const orderConfirmationVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'order_id', label: 'Order ID', description: 'Unique order identifier', example: 'ORD-2026-001234' },
  { key: 'order_date', label: 'Order Date', description: 'Date the order was placed', example: 'February 5, 2026' },
  { key: 'gift_name', label: 'Gift Name', description: 'Name of the selected gift', example: 'Premium Wireless Headphones' },
  { key: 'gift_description', label: 'Gift Description', description: 'Description of the gift', example: 'High-quality wireless headphones with noise cancellation' },
  { key: 'gift_quantity', label: 'Gift Quantity', description: 'Number of items ordered', example: '1' },
  { key: 'gift_image_url', label: 'Gift Image URL', description: 'URL to the gift image', example: 'https://example.com/images/gift.jpg' },
  { key: 'shipping_address', label: 'Shipping Address', description: 'Full shipping address', example: '123 Main St, San Francisco, CA 94105, United States' },
  { key: 'estimated_delivery', label: 'Estimated Delivery', description: 'Expected delivery date', example: 'February 15-20, 2026' },
  { key: 'tracking_url', label: 'Tracking URL', description: 'URL to track the shipment', example: 'https://tracking.example.com/track/ABC123' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export const orderCancellationVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'order_id', label: 'Order ID', description: 'Unique order identifier', example: 'ORD-2026-001234' },
  { key: 'order_date', label: 'Order Date', description: 'Date the order was placed', example: 'February 5, 2026' },
  { key: 'gift_name', label: 'Gift Name', description: 'Name of the selected gift', example: 'Premium Wireless Headphones' },
  { key: 'gift_description', label: 'Gift Description', description: 'Description of the gift', example: 'High-quality wireless headphones with noise cancellation' },
  { key: 'gift_quantity', label: 'Gift Quantity', description: 'Number of items ordered', example: '1' },
  { key: 'gift_image_url', label: 'Gift Image URL', description: 'URL to the gift image', example: 'https://example.com/images/gift.jpg' },
  { key: 'shipping_address', label: 'Shipping Address', description: 'Full shipping address', example: '123 Main St, San Francisco, CA 94105, United States' },
  { key: 'tracking_url', label: 'Tracking URL', description: 'URL to track the shipment or return to portal', example: 'https://tracking.example.com/track/ABC123' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export const giftReminderVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'site_name', label: 'Site Name', description: 'Name of the gifting site', example: 'TechCorp Employee Gifts 2026' },
  { key: 'site_url', label: 'Site URL', description: 'URL to access the gifting portal', example: 'https://techcorp-gifts.jala.com' },
  { key: 'days_remaining', label: 'Days Remaining', description: 'Days until the offer expires', example: '15' },
  { key: 'expiration_date', label: 'Expiration Date', description: 'When the offer expires', example: 'March 31, 2026' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export const shippingNotificationVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'order_id', label: 'Order ID', description: 'Unique order identifier', example: 'ORD-2026-001234' },
  { key: 'order_date', label: 'Order Date', description: 'Date the order was placed', example: 'February 5, 2026' },
  { key: 'gift_name', label: 'Gift Name', description: 'Name of the selected gift', example: 'Premium Wireless Headphones' },
  { key: 'gift_description', label: 'Gift Description', description: 'Description of the gift', example: 'High-quality wireless headphones with noise cancellation' },
  { key: 'gift_quantity', label: 'Gift Quantity', description: 'Number of items ordered', example: '1' },
  { key: 'gift_image_url', label: 'Gift Image URL', description: 'URL to the gift image', example: 'https://example.com/images/gift.jpg' },
  { key: 'shipping_address', label: 'Shipping Address', description: 'Full shipping address', example: '123 Main St, San Francisco, CA 94105, United States' },
  { key: 'estimated_delivery', label: 'Estimated Delivery', description: 'Expected delivery date', example: 'February 15-20, 2026' },
  { key: 'tracking_url', label: 'Tracking URL', description: 'URL to track the shipment', example: 'https://tracking.example.com/track/ABC123' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export const giftDeliveredVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'order_id', label: 'Order ID', description: 'Unique order identifier', example: 'ORD-2026-001234' },
  { key: 'order_date', label: 'Order Date', description: 'Date the order was placed', example: 'February 5, 2026' },
  { key: 'gift_name', label: 'Gift Name', description: 'Name of the selected gift', example: 'Premium Wireless Headphones' },
  { key: 'gift_description', label: 'Gift Description', description: 'Description of the gift', example: 'High-quality wireless headphones with noise cancellation' },
  { key: 'gift_quantity', label: 'Gift Quantity', description: 'Number of items ordered', example: '1' },
  { key: 'gift_image_url', label: 'Gift Image URL', description: 'URL to the gift image', example: 'https://example.com/images/gift.jpg' },
  { key: 'shipping_address', label: 'Shipping Address', description: 'Full shipping address', example: '123 Main St, San Francisco, CA 94105, United States' },
  { key: 'estimated_delivery', label: 'Estimated Delivery', description: 'Expected delivery date', example: 'February 15-20, 2026' },
  { key: 'tracking_url', label: 'Tracking URL', description: 'URL to track the shipment', example: 'https://tracking.example.com/track/ABC123' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export const passwordResetVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'reset_url', label: 'Reset URL', description: 'URL to reset the password', example: 'https://example.com/reset-password/ABC123' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export const accountCreatedVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'login_url', label: 'Login URL', description: 'URL to log in to the account', example: 'https://example.com/login' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export const feedbackRequestVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'feedback_url', label: 'Feedback URL', description: 'URL to provide feedback', example: 'https://example.com/feedback' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export const expirationWarningVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'expiration_date', label: 'Expiration Date', description: 'When the offer expires', example: 'March 31, 2026' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export const thankYouVariables: EmailTemplateVariable[] = [
  { key: 'recipient_name', label: 'Recipient Name', description: 'Full name of the recipient', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', description: 'Email address of the recipient', example: 'john.doe@company.com' },
  { key: 'company_name', label: 'Company Name', description: 'Name of the company', example: 'TechCorp Inc.' },
  { key: 'support_email', label: 'Support Email', description: 'Contact email for support', example: 'support@company.com' },
];

export function getVariablesForType(type: EmailTemplateType): EmailTemplateVariable[] {
  switch (type) {
    case 'invite':
      return inviteVariables;
    case 'order_confirmation':
      return orderConfirmationVariables;
    case 'order_cancellation':
      return orderCancellationVariables;
    case 'gift_reminder':
      return giftReminderVariables;
    case 'shipping_notification':
      return shippingNotificationVariables;
    case 'gift_delivered':
      return giftDeliveredVariables;
    case 'password_reset':
      return passwordResetVariables;
    case 'account_created':
      return accountCreatedVariables;
    case 'feedback_request':
      return feedbackRequestVariables;
    case 'expiration_warning':
      return expirationWarningVariables;
    case 'thank_you':
      return thankYouVariables;
    default:
      return [];
  }
}

export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}