/**
 * Adapter Functions for Multi-Tenant Orders API
 * 
 * Converts between:
 * - Simple API format (backward compatible with KV store version)
 * - Complex database format (multi-tenant schema)
 */

import type { Product, Order as DbOrder } from "./database/types.ts";
import type { Gift, Order as ApiOrder, OrderStatus } from "./gifts_api_v2.ts";
import * as db from "./database/db.ts";

// ==================== Status Mapping ====================

/**
 * Map API status to database status
 * API: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled'
 * DB:  'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
 */
export function apiStatusToDbStatus(apiStatus: OrderStatus): DbOrder['status'] {
  const statusMap: Record<OrderStatus, DbOrder['status']> = {
    'pending': 'pending',
    'processing': 'processing',
    'shipped': 'shipped',
    'in_transit': 'shipped',  // Map to shipped
    'out_for_delivery': 'shipped',  // Map to shipped
    'delivered': 'delivered',
    'cancelled': 'cancelled',
  };
  return statusMap[apiStatus] || 'pending';
}

/**
 * Map database status to API status
 */
export function dbStatusToApiStatus(dbStatus: DbOrder['status']): OrderStatus {
  const statusMap: Record<DbOrder['status'], OrderStatus> = {
    'pending': 'pending',
    'confirmed': 'processing',  // Map confirmed to processing
    'processing': 'processing',
    'shipped': 'shipped',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
  };
  return statusMap[dbStatus] || 'pending';
}

// ==================== Product/Gift Conversion ====================

/**
 * Convert database Product to API Gift format
 */
export function productToGift(product: Product): Gift {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    longDescription: product.description || '',
    image: product.image_url || '',
    category: product.category || '',
    price: product.price,
    sku: product.sku,
    features: product.features || [],
    specifications: product.specifications || {},
    status: product.status === 'out_of_stock' ? 'inactive' : product.status,
    availableQuantity: product.available_quantity || 0,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

// ==================== Order Conversion ====================

/**
 * Convert database Order to API Order format
 * Handles multi-item orders by using the first item for backward compatibility
 */
export function dbOrderToApiOrder(dbOrder: DbOrder, product: Product): ApiOrder {
  // Get first item (for backward compatibility with single-item API)
  const firstItem = dbOrder.items[0];
  
  if (!firstItem) {
    throw new Error('Order has no items');
  }
  
  // Calculate estimated delivery (7 days from order date if not delivered)
  const estimatedDelivery = dbOrder.delivered_at 
    ? new Date(dbOrder.delivered_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : new Date(new Date(dbOrder.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
  
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    userId: dbOrder.customer_employee_id || dbOrder.customer_email,
    userEmail: dbOrder.customer_email,
    siteId: dbOrder.site_id,
    gift: productToGift(product),
    quantity: firstItem.quantity,
    status: dbStatusToApiStatus(dbOrder.status),
    shippingAddress: dbOrder.shipping_address as ApiOrder['shippingAddress'],
    trackingNumber: dbOrder.tracking_number,
    carrier: dbOrder.metadata?.carrier,
    orderDate: dbOrder.created_at,
    estimatedDelivery,
    actualDelivery: dbOrder.delivered_at,
    timeline: dbOrder.metadata?.timeline || [],
  };
}

/**
 * Convert API order input to database order input
 * Requires client_id and site_id from context
 */
export async function apiOrderInputToDbOrderInput(
  apiInput: {
    userId: string;
    userEmail: string;
    giftId: string;
    quantity: number;
    shippingAddress: ApiOrder['shippingAddress'];
    siteId?: string;
  },
  product: Product,
  siteId: string
): Promise<{
  client_id: string;
  site_id: string;
  product_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_employee_id?: string;
  status: 'pending';
  total_amount: number;
  currency: string;
  shipping_address: Record<string, any>;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  metadata: Record<string, any>;
}> {
  // Get site to find client_id
  const site = await db.getSiteById(siteId);
  if (!site) {
    throw new Error(`Site not found: ${siteId}`);
  }
  
  const unitPrice = product.price;
  const totalPrice = unitPrice * apiInput.quantity;
  
  // Create initial timeline
  const orderDate = new Date().toISOString();
  const timeline = [
    {
      status: 'pending',
      label: 'Order Placed',
      timestamp: orderDate,
      location: 'Online',
      description: 'Your order has been received and is being processed'
    }
  ];
  
  return {
    client_id: site.client_id,
    site_id: siteId,
    product_id: apiInput.giftId,
    order_number: db.generateOrderNumber(),
    customer_name: apiInput.shippingAddress.fullName,
    customer_email: apiInput.userEmail,
    customer_employee_id: apiInput.userId,
    status: 'pending',
    total_amount: totalPrice,
    currency: product.currency,
    shipping_address: apiInput.shippingAddress,
    items: [{
      product_id: apiInput.giftId,
      product_name: product.name,
      quantity: apiInput.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
    }],
    metadata: {
      timeline,
    },
  };
}

/**
 * Get timeline event for status update
 */
export function getTimelineEventForStatus(
  status: OrderStatus,
  trackingNumber?: string,
  carrier?: string
): {
  status: string;
  label: string;
  timestamp: string;
  location: string;
  description: string;
} | null {
  const timestamp = new Date().toISOString();
  
  const events: Record<OrderStatus, { label: string; location: string; description: string } | null> = {
    'pending': null,
    'processing': {
      label: 'Processing',
      location: 'Warehouse',
      description: 'Your order is being prepared for shipment'
    },
    'shipped': {
      label: 'Shipped',
      location: 'Distribution Center',
      description: trackingNumber 
        ? `Package shipped via ${carrier || 'carrier'}. Tracking: ${trackingNumber}`
        : 'Package has left our warehouse and is on its way'
    },
    'in_transit': {
      label: 'In Transit',
      location: 'Regional Hub',
      description: 'Package is on its way to your delivery address'
    },
    'out_for_delivery': {
      label: 'Out for Delivery',
      location: 'Local Facility',
      description: 'Package is out for delivery and will arrive soon'
    },
    'delivered': {
      label: 'Delivered',
      location: 'Your Address',
      description: 'Package has been successfully delivered'
    },
    'cancelled': {
      label: 'Cancelled',
      location: 'System',
      description: 'Order has been cancelled'
    },
  };
  
  const eventData = events[status];
  if (!eventData) return null;
  
  return {
    status,
    label: eventData.label,
    timestamp,
    location: eventData.location,
    description: eventData.description,
  };
}
