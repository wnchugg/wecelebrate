import { GlobalTemplate, getVariablesForType } from '../types/emailTemplates';

export const globalTemplates: GlobalTemplate[] = [
  {
    id: 'global-invite',
    type: 'invite',
    name: 'Gift Selection Invite',
    description: 'Initial invitation to select a gift from the portal',
    category: 'transactional',
    defaultSubject: "You've been invited to select your gift from {{company_name}}",
    defaultHtmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D91C81;">Hello {{recipient_name}}!</h1>
        <p>You've been invited to select a gift from <strong>{{company_name}}</strong>.</p>
        <p>Visit our gift selection portal to choose your gift:</p>
        <a href="{{site_url}}" style="display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Select Your Gift</a>
        <p><strong>Access Code:</strong> {{access_code}}</p>
        <p><em>This invitation expires on {{expiration_date}}</em></p>
        <p style="color: #666; font-size: 12px;">If you have any questions, contact us at {{support_email}}</p>
      </div>
    `,
    defaultTextContent: "Hello {{recipient_name}}! You've been invited to select a gift from {{company_name}}. Visit {{site_url}} and use access code: {{access_code}}. This invitation expires on {{expiration_date}}.",
    defaultSmsContent: 'Hi {{recipient_name}}! Select your gift from {{company_name}}: {{site_url}} Code: {{access_code}}',
    defaultPushTitle: 'Gift Selection Available',
    defaultPushBody: "You've been invited to select your gift from {{company_name}}. Tap to choose!",
    variables: getVariablesForType('invite'),
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'global-order-confirmation',
    type: 'order_confirmation',
    name: 'Order Confirmation',
    description: 'Confirmation sent after user selects a gift',
    category: 'transactional',
    defaultSubject: 'Your gift order has been confirmed - Order #{{order_id}}',
    defaultHtmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D91C81;">Order Confirmed!</h1>
        <p>Thank you, {{recipient_name}}! Your gift order has been confirmed.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> {{order_id}}</p>
          <p><strong>Order Date:</strong> {{order_date}}</p>
          <p><strong>Gift:</strong> {{gift_name}}</p>
          <p><strong>Quantity:</strong> {{gift_quantity}}</p>
          <p><strong>Shipping Address:</strong><br>{{shipping_address}}</p>
          <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
        </div>
        <p>You can track your shipment at: <a href="{{tracking_url}}" style="color: #D91C81;">{{tracking_url}}</a></p>
        <p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p>
      </div>
    `,
    defaultTextContent: 'Order Confirmed! Thank you {{recipient_name}}. Order #{{order_id}} - {{gift_name}} x{{gift_quantity}}. Shipping to: {{shipping_address}}. Estimated delivery: {{estimated_delivery}}. Track: {{tracking_url}}',
    defaultSmsContent: 'Your gift order #{{order_id}} is confirmed! Track: {{tracking_url}}',
    defaultPushTitle: 'Order Confirmed',
    defaultPushBody: 'Your gift {{gift_name}} is confirmed and will arrive {{estimated_delivery}}',
    variables: getVariablesForType('order_confirmation'),
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'global-gift-reminder',
    type: 'gift_reminder',
    name: 'Gift Selection Reminder',
    description: 'Reminder for users who have not selected their gift yet',
    category: 'marketing',
    defaultSubject: 'Reminder: Select your gift from {{company_name}} - {{days_remaining}} days left!',
    defaultHtmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D91C81;">Don't miss out, {{recipient_name}}!</h1>
        <p>This is a friendly reminder that you still have <strong>{{days_remaining}} days</strong> to select your gift from {{company_name}}.</p>
        <a href="{{site_url}}" style="display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Select Your Gift Now</a>
        <p><em>Your invitation expires on {{expiration_date}}</em></p>
        <p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p>
      </div>
    `,
    defaultTextContent: 'Hi {{recipient_name}}! Reminder: You have {{days_remaining}} days left to select your gift from {{company_name}}. Visit: {{site_url}} Expires: {{expiration_date}}',
    defaultSmsContent: 'Reminder: {{days_remaining}} days to select your gift from {{company_name}}! {{site_url}}',
    defaultPushTitle: 'Gift Selection Reminder',
    defaultPushBody: 'You have {{days_remaining}} days left to select your gift. Do not miss out!',
    variables: getVariablesForType('gift_reminder'),
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'global-shipping-notification',
    type: 'shipping_notification',
    name: 'Shipping Notification',
    description: 'Notification when gift has shipped',
    category: 'transactional',
    defaultSubject: 'Your gift has shipped! - Order #{{order_id}}',
    defaultHtmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D91C81;">Your Gift is On the Way!</h1>
        <p>Great news, {{recipient_name}}! Your gift has been shipped.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> {{order_id}}</p>
          <p><strong>Gift:</strong> {{gift_name}}</p>
          <p><strong>Shipping to:</strong><br>{{shipping_address}}</p>
          <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
        </div>
        <a href="{{tracking_url}}" style="display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Track Your Shipment</a>
        <p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p>
      </div>
    `,
    defaultTextContent: 'Your gift has shipped! Order #{{order_id}} - {{gift_name}}. Estimated delivery: {{estimated_delivery}}. Track: {{tracking_url}}',
    defaultSmsContent: 'Your gift from {{company_name}} has shipped! Track: {{tracking_url}}',
    defaultPushTitle: 'Gift Shipped',
    defaultPushBody: 'Your {{gift_name}} is on the way! Arriving {{estimated_delivery}}',
    variables: getVariablesForType('shipping_notification'),
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'global-gift-delivered',
    type: 'gift_delivered',
    name: 'Delivery Confirmation',
    description: 'Confirmation when gift has been delivered',
    category: 'transactional',
    defaultSubject: 'Your gift has been delivered! - Order #{{order_id}}',
    defaultHtmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D91C81;">Your Gift Has Arrived!</h1>
        <p>Great news, {{recipient_name}}! Your gift has been delivered.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> {{order_id}}</p>
          <p><strong>Gift:</strong> {{gift_name}}</p>
          <p><strong>Delivered to:</strong><br>{{shipping_address}}</p>
        </div>
        <p>We hope you enjoy your gift from {{company_name}}!</p>
        <p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p>
      </div>
    `,
    defaultTextContent: 'Your gift has been delivered! Order #{{order_id}} - {{gift_name}}. Delivered to: {{shipping_address}}',
    defaultSmsContent: 'Your gift from {{company_name}} has been delivered! Enjoy!',
    defaultPushTitle: 'Gift Delivered',
    defaultPushBody: 'Your {{gift_name}} has been delivered. Enjoy!',
    variables: getVariablesForType('gift_delivered'),
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'global-feedback-request',
    type: 'feedback_request',
    name: 'Feedback Request',
    description: 'Request feedback after gift delivery',
    category: 'marketing',
    defaultSubject: 'How was your gift experience with {{company_name}}?',
    defaultHtmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D91C81;">We'd Love Your Feedback!</h1>
        <p>Hi {{recipient_name}},</p>
        <p>We hope you enjoyed your gift from {{company_name}}. We would love to hear about your experience!</p>
        <a href="{{feedback_url}}" style="display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Share Your Feedback</a>
        <p>Your feedback helps us improve our gifting program.</p>
        <p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p>
      </div>
    `,
    defaultTextContent: 'Hi {{recipient_name}}! We would love your feedback on your gift from {{company_name}}. Share your thoughts: {{feedback_url}}',
    defaultSmsContent: 'How was your gift from {{company_name}}? Share feedback: {{feedback_url}}',
    defaultPushTitle: 'Share Your Feedback',
    defaultPushBody: 'How was your gift experience? Tap to share your thoughts!',
    variables: getVariablesForType('feedback_request'),
    isSystem: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'global-expiration-warning',
    type: 'expiration_warning',
    name: 'Expiration Warning',
    description: 'Final warning before gift selection expires',
    category: 'marketing',
    defaultSubject: 'URGENT: Your gift selection expires on {{expiration_date}}',
    defaultHtmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D91C81;">Last Chance, {{recipient_name}}!</h1>
        <p><strong>Your gift selection opportunity expires on {{expiration_date}}.</strong></p>
        <p>Do not miss out on your gift from {{company_name}}. Select your gift now before it is too late!</p>
        <a href="{{site_url}}" style="display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Select Your Gift Now</a>
        <p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p>
      </div>
    `,
    defaultTextContent: 'URGENT {{recipient_name}}: Your gift selection from {{company_name}} expires on {{expiration_date}}. Select now: {{site_url}}',
    defaultSmsContent: 'URGENT: Gift selection expires {{expiration_date}}! Select now: {{site_url}}',
    defaultPushTitle: 'Last Chance',
    defaultPushBody: 'Your gift selection expires on {{expiration_date}}. Select now!',
    variables: getVariablesForType('expiration_warning'),
    isSystem: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'global-password-reset',
    type: 'password_reset',
    name: 'Password Reset',
    description: 'Password reset request notification with secure link',
    category: 'system',
    defaultSubject: 'Password Reset Request - {{company_name}}',
    defaultHtmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D91C81;">Password Reset Request</h1>
        <p>Hi {{recipient_name}},</p>
        <p>We received a request to reset your password for your {{company_name}} account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="{{reset_url}}" style="display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
        <p><strong>This link will expire in 24 hours for security reasons.</strong></p>
        <p>If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          For security reasons, do not share this link with anyone. If you have questions, contact {{support_email}}
        </p>
      </div>
    `,
    defaultTextContent: 'Password Reset Request - Hi {{recipient_name}}, click this link to reset your password: {{reset_url}}. This link expires in 24 hours. If you did not request this, please ignore this message.',
    defaultSmsContent: 'Password reset for {{company_name}}: {{reset_url}} (expires in 24 hours)',
    defaultPushTitle: 'Password Reset Request',
    defaultPushBody: 'Tap to reset your password. Link expires in 24 hours.',
    variables: getVariablesForType('password_reset'),
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'global-order-cancellation',
    type: 'order_cancellation',
    name: 'Order Cancellation',
    description: 'Notification when an order has been cancelled',
    category: 'transactional',
    defaultSubject: 'Order Cancelled - Order #{{order_id}}',
    defaultHtmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D91C81;">Order Cancelled</h1>
        <p>Hi {{recipient_name}},</p>
        <p>Your gift order has been cancelled as requested.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> {{order_id}}</p>
          <p><strong>Order Date:</strong> {{order_date}}</p>
          <p><strong>Gift:</strong> {{gift_name}}</p>
          <p><strong>Quantity:</strong> {{gift_quantity}}</p>
          <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Cancelled</span></p>
        </div>
        <p>If you would like to make a new selection, please visit the gift portal:</p>
        <a href="{{tracking_url}}" style="display: inline-block; background-color: #D91C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Visit Gift Portal</a>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you did not request this cancellation or have questions, please contact {{support_email}}
        </p>
      </div>
    `,
    defaultTextContent: 'Order Cancelled - Hi {{recipient_name}}, your order #{{order_id}} for {{gift_name}} has been cancelled. Order date: {{order_date}}. Questions? Contact {{support_email}}',
    defaultSmsContent: 'Your order #{{order_id}} has been cancelled. Questions? {{support_email}}',
    defaultPushTitle: 'Order Cancelled',
    defaultPushBody: 'Your order for {{gift_name}} has been cancelled',
    variables: getVariablesForType('order_cancellation'),
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'global-thank-you',
    type: 'thank_you',
    name: 'Thank You',
    description: 'Thank you message after gift selection',
    category: 'marketing',
    defaultSubject: 'Thank you from {{company_name}}!',
    defaultHtmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D91C81;">Thank You, {{recipient_name}}!</h1>
        <p>Thank you for being a valued part of {{company_name}}.</p>
        <p>We hope you enjoy your gift and look forward to continuing to celebrate with you!</p>
        <p>Best regards,<br>The {{company_name}} Team</p>
        <p style="color: #666; font-size: 12px;">Questions? Contact {{support_email}}</p>
      </div>
    `,
    defaultTextContent: 'Thank you {{recipient_name}} from {{company_name}}! We appreciate you.',
    defaultSmsContent: 'Thank you {{recipient_name}}! - {{company_name}}',
    defaultPushTitle: 'Thank You',
    defaultPushBody: 'Thank you for being a valued part of {{company_name}}!',
    variables: getVariablesForType('thank_you'),
    isSystem: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];
