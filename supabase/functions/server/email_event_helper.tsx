/**
 * Email Event Helper
 * Simplifies triggering email automation events from anywhere in the application
 */

import * as emailAutomation from './email_automation.tsx';

/**
 * Trigger types supported by the automation system
 */
export type TriggerType = 
  | 'employee_added'
  | 'gift_selected'
  | 'order_placed'
  | 'order_shipped'
  | 'order_delivered'
  | 'selection_expiring'
  | 'anniversary_approaching';

/**
 * Base context that all triggers require
 */
interface BaseEventContext {
  recipientEmail: string;
  variables: Record<string, string>;
  [key: string]: any;
}

/**
 * Helper function to trigger an email event
 * Returns true if at least one email was sent, false otherwise
 */
export async function triggerEvent(
  siteId: string,
  trigger: TriggerType,
  context: BaseEventContext,
  environmentId: string = 'development'
): Promise<boolean> {
  try {
    const result = await emailAutomation.triggerEmailEvent(
      { siteId, trigger, context },
      environmentId
    );
    
    console.log(`[Email Event Helper] Triggered ${trigger} for site ${siteId}: ${result.emailsSent} emails sent`);
    return result.emailsSent > 0;
  } catch (error: any) {
    console.error(`[Email Event Helper] Failed to trigger ${trigger}:`, error);
    return false;
  }
}

/**
 * Trigger employee_added event
 */
export async function notifyEmployeeAdded(
  siteId: string,
  employee: {
    email: string;
    name: string;
    serialCode: string;
  },
  site: {
    name: string;
  },
  client: {
    name: string;
  },
  environmentId: string = 'development'
): Promise<boolean> {
  const magicLink = `${Deno.env.get('ALLOWED_ORIGINS')?.split(',')[0] || 'https://app.wecelebrate.com'}/access?code=${employee.serialCode}`;
  
  return triggerEvent(
    siteId,
    'employee_added',
    {
      recipientEmail: employee.email,
      variables: {
        userName: employee.name,
        employeeName: employee.name,
        siteName: site.name,
        companyName: client.name,
        serialCode: employee.serialCode,
        magicLink: magicLink,
        accessLink: magicLink,
      },
      employeeData: employee,
    },
    environmentId
  );
}

/**
 * Trigger gift_selected event
 */
export async function notifyGiftSelected(
  siteId: string,
  employee: {
    email: string;
    name: string;
  },
  gift: {
    name: string;
    imageUrl?: string;
  },
  environmentId: string = 'development'
): Promise<boolean> {
  return triggerEvent(
    siteId,
    'gift_selected',
    {
      recipientEmail: employee.email,
      variables: {
        userName: employee.name,
        employeeName: employee.name,
        giftName: gift.name,
        giftImage: gift.imageUrl || '',
      },
      giftData: gift,
    },
    environmentId
  );
}

/**
 * Trigger order_placed event
 */
export async function notifyOrderPlaced(
  siteId: string,
  order: {
    id: string;
    recipientEmail: string;
    recipientName: string;
    totalAmount?: number;
    items?: any[];
  },
  environmentId: string = 'development'
): Promise<boolean> {
  return triggerEvent(
    siteId,
    'order_placed',
    {
      recipientEmail: order.recipientEmail,
      variables: {
        userName: order.recipientName,
        orderNumber: order.id,
        orderId: order.id,
        orderTotal: order.totalAmount?.toString() || '0',
        orderDate: new Date().toLocaleDateString(),
      },
      orderData: order,
    },
    environmentId
  );
}

/**
 * Trigger order_shipped event
 */
export async function notifyOrderShipped(
  siteId: string,
  order: {
    id: string;
    recipientEmail: string;
    recipientName: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  },
  environmentId: string = 'development'
): Promise<boolean> {
  const trackingLink = order.trackingNumber 
    ? `https://www.${order.carrier?.toLowerCase() || 'tracking'}.com/track/${order.trackingNumber}`
    : '';
  
  return triggerEvent(
    siteId,
    'order_shipped',
    {
      recipientEmail: order.recipientEmail,
      variables: {
        userName: order.recipientName,
        orderNumber: order.id,
        orderId: order.id,
        trackingNumber: order.trackingNumber || 'N/A',
        carrier: order.carrier || 'Standard Shipping',
        trackingLink: trackingLink,
        estimatedDelivery: order.estimatedDelivery || 'Within 5-7 business days',
      },
      orderData: order,
    },
    environmentId
  );
}

/**
 * Trigger order_delivered event
 */
export async function notifyOrderDelivered(
  siteId: string,
  order: {
    id: string;
    recipientEmail: string;
    recipientName: string;
    deliveryDate?: string;
  },
  environmentId: string = 'development'
): Promise<boolean> {
  return triggerEvent(
    siteId,
    'order_delivered',
    {
      recipientEmail: order.recipientEmail,
      variables: {
        userName: order.recipientName,
        orderNumber: order.id,
        orderId: order.id,
        deliveryDate: order.deliveryDate || new Date().toLocaleDateString(),
      },
      orderData: order,
    },
    environmentId
  );
}

/**
 * Trigger selection_expiring event (for reminders before deadline)
 */
export async function notifySelectionExpiring(
  siteId: string,
  employee: {
    email: string;
    name: string;
    serialCode: string;
  },
  site: {
    name: string;
    expiryDate?: string;
  },
  daysRemaining: number,
  environmentId: string = 'development'
): Promise<boolean> {
  const magicLink = `${Deno.env.get('ALLOWED_ORIGINS')?.split(',')[0] || 'https://app.wecelebrate.com'}/access?code=${employee.serialCode}`;
  
  return triggerEvent(
    siteId,
    'selection_expiring',
    {
      recipientEmail: employee.email,
      variables: {
        userName: employee.name,
        employeeName: employee.name,
        siteName: site.name,
        expiryDate: site.expiryDate || 'soon',
        daysRemaining: daysRemaining.toString(),
        magicLink: magicLink,
        accessLink: magicLink,
      },
      employeeData: employee,
    },
    environmentId
  );
}

/**
 * Trigger anniversary_approaching event (for service anniversaries)
 */
export async function notifyAnniversaryApproaching(
  siteId: string,
  employee: {
    email: string;
    name: string;
    anniversaryDate: string;
    yearsOfService: number;
  },
  environmentId: string = 'development'
): Promise<boolean> {
  return triggerEvent(
    siteId,
    'anniversary_approaching',
    {
      recipientEmail: employee.email,
      variables: {
        userName: employee.name,
        employeeName: employee.name,
        anniversaryDate: employee.anniversaryDate,
        yearsOfService: employee.yearsOfService.toString(),
      },
      employeeData: employee,
    },
    environmentId
  );
}

/**
 * Batch trigger - send the same event to multiple recipients
 * Useful for bulk operations like importing employees
 */
export async function triggerBatchEvents(
  siteId: string,
  trigger: TriggerType,
  contexts: BaseEventContext[],
  environmentId: string = 'development'
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  
  // Process in parallel batches of 10 to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < contexts.length; i += batchSize) {
    const batch = contexts.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(context => triggerEvent(siteId, trigger, context, environmentId))
    );
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        sent++;
      } else {
        failed++;
      }
    });
  }
  
  console.log(`[Email Event Helper] Batch ${trigger}: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}
