import { EmailTemplate } from '../types/emailTemplates';

export const defaultInviteTemplate: Omit<EmailTemplate, 'id' | 'siteId' | 'createdAt' | 'updatedAt' | 'globalTemplateId'> = {
  type: 'invite',
  name: 'Welcome - Gift Selection Invitation',
  subject: 'You\'ve Been Selected for an Exclusive Gift from {{company_name}}',
  enabled: true,
  emailEnabled: true,
  pushEnabled: false,
  smsEnabled: false,
  htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gift Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D91C81 0%, #B71569 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🎁 You Have a Gift Waiting!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi <strong>{{recipient_name}}</strong>,
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                <strong>{{company_name}}</strong> is excited to offer you an exclusive gift as a token of our appreciation! You've been invited to select from our curated collection of premium gifts.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Visit your personalized gift selection portal:
                <a href="{{site_url}}" style="color: #D91C81; text-decoration: none;">{{site_url}}</a>
              </p>
              
              <!-- Access Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="color: #1f2937; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">Your Access Details:</p>
                    <p style="color: #4b5563; font-size: 14px; margin: 0 0 5px 0;">Portal: {{site_name}}</p>
                    <p style="color: #4b5563; font-size: 14px; margin: 0 0 5px 0;">Email: {{recipient_email}}</p>
                    <p style="color: #4b5563; font-size: 14px; margin: 0;">Expires: {{expiration_date}}</p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If you have any questions or need assistance, please contact us at <a href="mailto:{{support_email}}" style="color: #D91C81; text-decoration: none;">{{support_email}}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0;">
                This email was sent by {{company_name}}<br>
                You received this because you were selected for a gift offering.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `,
  textContent: `
You Have a Gift Waiting!

Hi {{recipient_name}},

{{company_name}} is excited to offer you an exclusive gift as a token of our appreciation! You've been invited to select from our curated collection of premium gifts.

Visit your personalized gift selection portal:
{{site_url}}

Your Access Details:
- Portal: {{site_name}}
- Email: {{recipient_email}}
- Expires: {{expiration_date}}

If you have any questions or need assistance, please contact us at {{support_email}}

This email was sent by {{company_name}}
You received this because you were selected for a gift offering.
  `,
};

export const defaultOrderConfirmationTemplate: Omit<EmailTemplate, 'id' | 'siteId' | 'createdAt' | 'updatedAt' | 'globalTemplateId'> = {
  type: 'order_confirmation',
  name: 'Order Confirmation',
  subject: 'Order Confirmation - Your Gift is On Its Way! (Order #{{order_id}})',
  enabled: true,
  emailEnabled: true,
  pushEnabled: false,
  smsEnabled: false,
  gdprSettings: {
    includeDataProcessingNotice: true,
    includeUnsubscribeLink: true,
    includeDataDeletionInstructions: true,
    dataRetentionPeriod: '90 days after delivery',
    dataControllerName: '{{company_name}}',
    dataControllerEmail: '{{support_email}}',
  },
  htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00B4CC 0%, #0090A3 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">✓ Order Confirmed!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Thank you for your selection</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi <strong>{{recipient_name}}</strong>,
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Great news! Your gift order has been confirmed and will be shipped soon. Here are your order details:
              </p>
              
              <!-- Order Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
                          <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
                          <p style="color: #111827; font-size: 18px; font-weight: bold; margin: 5px 0 0 0;">{{order_id}}</p>
                        </td>
                        <td align="right" style="padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
                          <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</p>
                          <p style="color: #111827; font-size: 14px; margin: 5px 0 0 0;">{{order_date}}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Gift Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">Your Gift</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="80" valign="top">
                          <img src="{{gift_image_url}}" alt="{{gift_name}}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;" />
                        </td>
                        <td valign="top" style="padding-left: 15px;">
                          <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 5px 0;">{{gift_name}}</p>
                          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">{{gift_description}}</p>
                          <p style="color: #4b5563; font-size: 14px; margin: 0;">Quantity: {{gift_quantity}}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Shipping Information -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="color: #065f46; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">📦 Shipping Details</p>
                    <p style="color: #047857; font-size: 14px; margin: 0 0 5px 0; line-height: 1.5;">
                      {{shipping_address}}
                    </p>
                    <p style="color: #047857; font-size: 14px; margin: 10px 0 0 0;">
                      <strong>Estimated Delivery:</strong> {{estimated_delivery}}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Track Order Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="{{tracking_url}}" style="background: linear-gradient(135deg, #D91C81 0%, #B71569 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block;">
                      Track Your Order
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- GDPR Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <p style="color: #1e40af; font-size: 13px; font-weight: 600; margin: 0 0 10px 0;">🔒 Your Privacy & Data Rights (GDPR)</p>
                    <p style="color: #1e3a8a; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0;">
                      We process your personal data (name, email, shipping address) solely to fulfill your gift order. Your data is handled in accordance with GDPR and will be retained for {{data_retention_period}}.
                    </p>
                    <p style="color: #1e3a8a; font-size: 12px; line-height: 1.6; margin: 0;">
                      <strong>Your Rights:</strong> You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at <a href="mailto:{{support_email}}" style="color: #1e40af; text-decoration: none;">{{support_email}}</a>
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Questions? Contact us at <a href="mailto:{{support_email}}" style="color: #D91C81; text-decoration: none;">{{support_email}}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 10px 0;">
                Data Controller: {{company_name}}<br>
                Contact: {{support_email}}
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                This is a transactional email related to your order. You cannot unsubscribe from order-related communications.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `,
  textContent: `
Order Confirmed!

Hi {{recipient_name}},

Great news! Your gift order has been confirmed and will be shipped soon.

ORDER DETAILS
-------------
Order Number: {{order_id}}
Order Date: {{order_date}}

YOUR GIFT
---------
{{gift_name}}
{{gift_description}}
Quantity: {{gift_quantity}}

SHIPPING DETAILS
----------------
{{shipping_address}}
Estimated Delivery: {{estimated_delivery}}

Track your order: {{tracking_url}}

YOUR PRIVACY & DATA RIGHTS (GDPR)
----------------------------------
We process your personal data (name, email, shipping address) solely to fulfill your gift order. Your data is handled in accordance with GDPR and will be retained for {{data_retention_period}}.

Your Rights: You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at {{support_email}}

Data Controller: {{company_name}}
Contact: {{support_email}}

Questions? Contact us at {{support_email}}

This is a transactional email related to your order. You cannot unsubscribe from order-related communications.
  `,
};

export const defaultGiftReminderTemplate: Omit<EmailTemplate, 'id' | 'siteId' | 'createdAt' | 'updatedAt' | 'globalTemplateId'> = {
  type: 'gift_reminder',
  name: 'Gift Selection Reminder',
  subject: 'Reminder: Your Gift Selection Expires in {{days_remaining}} Days',
  enabled: true,
  emailEnabled: true,
  pushEnabled: false,
  smsEnabled: false,
  reminderSettings: {
    enabled: true,
    sendAfterDays: 7,
    maxReminders: 2,
    reminderIntervalDays: 7,
  },
  htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gift Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">⏰ Don't Miss Out!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Your gift is waiting</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi <strong>{{recipient_name}}</strong>,
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                This is a friendly reminder that you still haven't selected your exclusive gift from <strong>{{company_name}}</strong>.
              </p>
              
              <!-- Urgency Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td align="center">
                    <p style="color: #92400e; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
                      ⚠️ Only {{days_remaining}} Days Remaining!
                    </p>
                    <p style="color: #78350f; font-size: 14px; margin: 0;">
                      Your gift selection expires on <strong>{{expiration_date}}</strong>
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Don't let this opportunity slip away! Click the button below to browse our curated collection and choose your perfect gift.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{site_url}}" style="background: linear-gradient(135deg, #D91C81 0%, #B71569 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(217, 28, 129, 0.3);">
                      Select Your Gift Now
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Portal Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="color: #1f2937; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">Quick Access:</p>
                    <p style="color: #4b5563; font-size: 14px; margin: 0 0 5px 0;">Portal: {{site_name}}</p>
                    <p style="color: #4b5563; font-size: 14px; margin: 0 0 5px 0;">Your Email: {{recipient_email}}</p>
                    <p style="color: #4b5563; font-size: 14px; margin: 0;">Link: <a href="{{site_url}}" style="color: #D91C81; text-decoration: none;">{{site_url}}</a></p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Need help? Contact us at <a href="mailto:{{support_email}}" style="color: #D91C81; text-decoration: none;">{{support_email}}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0;">
                This is a reminder email from {{company_name}}<br>
                <a href="{{site_url}}/unsubscribe" style="color: #9ca3af; text-decoration: underline; font-size: 11px;">Unsubscribe from reminders</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `,
  textContent: `
Don't Miss Out!

Hi {{recipient_name}},

This is a friendly reminder that you still haven't selected your exclusive gift from {{company_name}}.

⚠️ ONLY {{days_remaining}} DAYS REMAINING!

Your gift selection expires on {{expiration_date}}

Don't let this opportunity slip away! Visit your personalized gift selection portal and choose your perfect gift.

{{site_url}}

QUICK ACCESS:
- Portal: {{site_name}}
- Your Email: {{recipient_email}}

Need help? Contact us at {{support_email}}

This is a reminder email from {{company_name}}
To unsubscribe from reminders, visit: {{site_url}}/unsubscribe
  `,
};