/**
 * Email Template Utilities
 * Functions to render email templates with variable substitution
 */

import { OrderTracking } from '../data/mockGiftFlow';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Order Confirmation Email Template
 */
export function generateOrderConfirmationEmail(
  orderNumber: string,
  orderId: string,
  customerName: string,
  customerEmail: string,
  giftName: string,
  giftImage: string,
  quantity: number,
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  estimatedDelivery: string
): EmailTemplate {
  const subject = `Order Confirmation ${orderNumber} - Your Gift is On Its Way! 🎁`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #D91C81 0%, #B71569 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Order Confirmed! 🎉</h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Thank you for your order</p>
    </div>
    
    <!-- Order Number -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Number</p>
      <p style="margin: 8px 0 0 0; color: #111827; font-size: 24px; font-weight: bold; font-family: monospace;">${orderNumber}</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 20px;">
      
      <!-- Greeting -->
      <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hi ${customerName},</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Great news! We've received your order and it's being prepared for shipment. Here are the details:
      </p>
      
      <!-- Gift Details -->
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 0 0 30px 0;">
        <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">Your Gift</h2>
        <div style="display: flex; gap: 15px; align-items: center;">
          <img src="${giftImage}" alt="${giftName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
          <div>
            <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 5px 0;">${giftName}</p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Quantity: ${quantity}</p>
          </div>
        </div>
      </div>
      
      <!-- Shipping Address -->
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 0 0 30px 0;">
        <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">Shipping Address</h2>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
          ${customerName}<br>
          ${shippingAddress.street}<br>
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
          ${shippingAddress.country}
        </p>
      </div>
      
      <!-- Estimated Delivery -->
      <div style="background: linear-gradient(135deg, #00B4CC 0%, #00E5A0 100%); border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 30px 0;">
        <p style="color: #ffffff; font-size: 14px; margin: 0; opacity: 0.9;">Estimated Delivery</p>
        <p style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 8px 0 0 0;">${estimatedDelivery}</p>
      </div>
      
      <!-- What's Next -->}
      <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 0 0 30px 0;">
        <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">What's Next?</h2>
        <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>We'll send you tracking information once your order ships</li>
          <li>You can track your order anytime using your order number</li>
          <li>Contact support if you have any questions</li>
        </ul>
      </div>
      
      <!-- Track Order Button -->
      <div style="text-align: center; margin: 0 0 30px 0;">
        <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://your-site.com'}/order-tracking/${orderId}" 
           style="display: inline-block; background: linear-gradient(135deg, #D91C81 0%, #B71569 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Track Your Order
        </a>
      </div>
      
      <!-- Support -->
      <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0; line-height: 1.6;">
        Need help? Contact us at <a href="mailto:support@company.com" style="color: #D91C81; text-decoration: none;">support@company.com</a><br>
        Order ID: <strong>${orderId}</strong>
      </p>
      
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        © 2026 JALA 2 Gift Platform. All rights reserved.
      </p>
    </div>
    
  </div>
</body>
</html>
  `;
  
  const text = `
Order Confirmed! 🎉

Hi ${customerName},

Great news! We've received your order and it's being prepared for shipment.

Order Number: ${orderNumber}

YOUR GIFT
---------
${giftName}
Quantity: ${quantity}

SHIPPING ADDRESS
----------------
${customerName}
${shippingAddress.street}
${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}
${shippingAddress.country}

ESTIMATED DELIVERY
------------------
${estimatedDelivery}

WHAT'S NEXT?
------------
- We'll send you tracking information once your order ships
- You can track your order anytime using your order number
- Contact support if you have any questions

Track your order: ${typeof window !== 'undefined' ? window.location.origin : 'https://your-site.com'}/order-tracking/${orderId}

Need help? Contact us at support@company.com
Order ID: ${orderId}

© 2026 JALA 2 Gift Platform. All rights reserved.
  `;
  
  return { subject, html, text };
}

// Aliases for backward compatibility
export const generateConfirmationEmail = generateOrderConfirmationEmail;
export const generateReminderEmail = generateOrderConfirmationEmail; // Can be customized later

/**
 * Shipping Notification Email Template
 */
export function generateShippingNotificationEmail(
  orderTracking: OrderTracking,
  customerName: string,
  customerEmail: string
): EmailTemplate {
  const subject = `Your Order ${orderTracking.orderNumber} Has Shipped! 📦`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipping Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #00B4CC 0%, #00E5A0 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Your Order Has Shipped! 📦</h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">It's on its way to you</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 20px;">
      
      <!-- Greeting -->
      <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hi ${customerName},</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Good news! Your order has been shipped and is on its way. Here are your tracking details:
      </p>
      
      <!-- Tracking Info -->
      <div style="background: linear-gradient(135deg, #D91C81 0%, #B71569 100%); border-radius: 12px; padding: 24px; margin: 0 0 30px 0; text-align: center;">
        <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; opacity: 0.9;">Tracking Number</p>
        <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0 0 16px 0; font-family: monospace;">${orderTracking.trackingNumber || 'N/A'}</p>
        <p style="color: #ffffff; font-size: 14px; margin: 0; opacity: 0.9;">Carrier: ${orderTracking.carrier || 'N/A'}</p>
      </div>
      
      <!-- Estimated Delivery -->
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 30px 0;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">Estimated Delivery</p>
        <p style="color: #111827; font-size: 20px; font-weight: bold; margin: 8px 0 0 0;">${orderTracking.estimatedDelivery}</p>
      </div>
      
      <!-- Gift Details -->
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 0 0 30px 0;">
        <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">Order Details</h2>
        <div style="display: flex; gap: 15px; align-items: center;">
          <img src="${orderTracking.gift.image}" alt="${orderTracking.gift.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
          <div>
            <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 5px 0;">${orderTracking.gift.name}</p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Order ${orderTracking.orderNumber}</p>
          </div>
        </div>
      </div>
      
      <!-- Track Package Button */-->
      <div style="text-align: center; margin: 0 0 30px 0;">
        <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://your-site.com'}/order-tracking/${orderTracking.orderId}" 
           style="display: inline-block; background: linear-gradient(135deg, #00B4CC 0%, #00E5A0 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Track Your Package
        </a>
      </div>
      
      <!-- Support -->
      <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0; line-height: 1.6;">
        Questions? Contact us at <a href="mailto:support@company.com" style="color: #D91C81; text-decoration: none;">support@company.com</a><br>
        Order ID: <strong>${orderTracking.orderId}</strong>
      </p>
      
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        © 2026 JALA 2 Gift Platform. All rights reserved.
      </p>
    </div>
    
  </div>
</body>
</html>
  `;
  
  const text = `
Your Order Has Shipped! 📦

Hi ${customerName},

Good news! Your order has been shipped and is on its way.

TRACKING INFORMATION
--------------------
Tracking Number: ${orderTracking.trackingNumber || 'N/A'}
Carrier: ${orderTracking.carrier || 'N/A'}

ESTIMATED DELIVERY
------------------
${orderTracking.estimatedDelivery}

ORDER DETAILS
-------------
${orderTracking.gift.name}
Order ${orderTracking.orderNumber}

Track your package: ${typeof window !== 'undefined' ? window.location.origin : 'https://your-site.com'}/order-tracking/${orderTracking.orderId}

Questions? Contact us at support@company.com
Order ID: ${orderTracking.orderId}

© 2026 JALA 2 Gift Platform. All rights reserved.
  `;
  
  return { subject, html, text };
}

/**
 * Delivery Notification Email Template
 */
export function generateDeliveryNotificationEmail(
  orderNumber: string,
  orderId: string,
  customerName: string,
  giftName: string
): EmailTemplate {
  const subject = `Your Order ${orderNumber} Has Been Delivered! 🎉`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Delivery Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Delivered!</h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your gift has arrived</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 20px;">
      
      <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hi ${customerName},</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Great news! Your order has been successfully delivered. We hope you enjoy your ${giftName}!
      </p>
      
      <!-- Order Number -->
      <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 30px 0;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">Order Number</p>
        <p style="color: #111827; font-size: 20px; font-weight: bold; margin: 8px 0 0 0; font-family: monospace;">${orderNumber}</p>
      </div>
      
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
        If you have any issues with your order or didn't receive it, please contact our support team immediately.
      </p>
      
      <!-- Support -->
      <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0; line-height: 1.6;">
        Need help? Contact us at <a href="mailto:support@company.com" style="color: #D91C81; text-decoration: none;">support@company.com</a><br>
        Order ID: <strong>${orderId}</strong>
      </p>
      
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        © 2026 JALA 2 Gift Platform. All rights reserved.
      </p>
    </div>
    
  </div>
</body>
</html>
  `;
  
  const text = `
Delivered! ✓

Hi ${customerName},

Great news! Your order has been successfully delivered. We hope you enjoy your ${giftName}!

Order Number: ${orderNumber}

If you have any issues with your order or didn't receive it, please contact our support team immediately.

Need help? Contact us at support@company.com
Order ID: ${orderId}

© 2026 JALA 2 Gift Platform. All rights reserved.
  `;
  
  return { subject, html, text };
}