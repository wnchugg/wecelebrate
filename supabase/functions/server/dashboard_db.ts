/**
 * Dashboard Analytics - Database Version
 * 
 * Replaces KV store with PostgreSQL database queries
 * Provides dashboard statistics, recent orders, and popular gifts
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

/**
 * Calculate growth percentage
 */
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * Calculate percentage
 */
function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Get dashboard statistics for a site
 */
export async function getDashboardStats(siteId: string, timeRange: string = '30d') {
  try {
    console.log(`[Dashboard Stats DB] Fetching stats for site: ${siteId}, timeRange: ${timeRange}`);
    
    // Calculate date ranges
    const now = new Date();
    let daysBack = 30;
    
    switch (timeRange) {
      case '7d':
        daysBack = 7;
        break;
      case '30d':
        daysBack = 30;
        break;
      case '90d':
        daysBack = 90;
        break;
      case '1y':
        daysBack = 365;
        break;
    }
    
    const currentPeriodStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(currentPeriodStart.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    // Fetch orders for current period
    const { data: currentOrders, error: currentError } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .eq('site_id', siteId)
      .gte('created_at', currentPeriodStart.toISOString())
      .lte('created_at', now.toISOString());
    
    if (currentError) throw currentError;
    
    // Fetch orders for previous period
    const { data: previousOrders, error: previousError } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .eq('site_id', siteId)
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', currentPeriodStart.toISOString());
    
    if (previousError) throw previousError;
    
    // Calculate order stats
    const totalOrders = currentOrders?.length || 0;
    const previousTotalOrders = previousOrders?.length || 0;
    const orderGrowth = calculateGrowth(totalOrders, previousTotalOrders);
    
    // Count pending shipments (orders with status 'pending' or 'processing')
    const pendingShipments = currentOrders?.filter(o => 
      o.status === 'pending' || o.status === 'processing'
    ).length || 0;
    
    const previousPendingShipments = previousOrders?.filter(o => 
      o.status === 'pending' || o.status === 'processing'
    ).length || 0;
    
    const pendingChange = calculateGrowth(pendingShipments, previousPendingShipments);
    
    // Fetch active employees for the site
    const { data: currentEmployees, error: empError } = await supabase
      .from('employees')
      .select('id, status')
      .eq('site_id', siteId)
      .eq('status', 'active');
    
    if (empError) throw empError;
    
    const activeEmployees = currentEmployees?.length || 0;
    
    // For previous period, we'll use the same count (employees don't change much)
    // In a real scenario, you might want to track employee status changes over time
    const previousActiveEmployees = activeEmployees;
    const employeeGrowth = calculateGrowth(activeEmployees, previousActiveEmployees);
    
    // Fetch available gifts/products
    // Get site's catalog assignments
    const { data: siteAssignments, error: assignError } = await supabase
      .from('site_catalog_assignments')
      .select('catalog_id')
      .eq('site_id', siteId);
    
    if (assignError) throw assignError;
    
    let giftsAvailable = 0;
    
    if (siteAssignments && siteAssignments.length > 0) {
      const catalogIds = siteAssignments.map(a => a.catalog_id);
      
      // Count active products in these catalogs
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id')
        .in('catalog_id', catalogIds)
        .eq('status', 'active');
      
      if (prodError) throw prodError;
      giftsAvailable = products?.length || 0;
    }
    
    // For simplicity, assume gifts available doesn't change much
    const previousGiftsAvailable = giftsAvailable;
    const giftsChange = calculateGrowth(giftsAvailable, previousGiftsAvailable);
    
    const stats = {
      totalOrders,
      previousOrders: previousTotalOrders,
      orderGrowth,
      activeEmployees,
      previousActiveEmployees,
      employeeGrowth,
      giftsAvailable,
      previousGiftsAvailable,
      giftsChange,
      pendingShipments,
      previousPendingShipments,
      pendingChange,
    };
    
    console.log(`[Dashboard Stats DB] Generated stats:`, stats);
    
    return {
      success: true,
      stats,
      timeRange,
      generatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Dashboard Stats DB] Error:', error);
    throw error;
  }
}

/**
 * Get recent orders for a site
 */
export async function getRecentOrders(siteId: string, limit: number = 5, status?: string) {
  try {
    console.log(`[Dashboard Recent Orders DB] Fetching for site: ${siteId}, limit: ${limit}, status: ${status}`);
    
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        currency,
        created_at,
        employee_id,
        product_id,
        employees (
          id,
          first_name,
          last_name,
          email
        ),
        products (
          id,
          name,
          image_url
        )
      `)
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: orders, error } = await query;
    
    if (error) throw error;
    
    // Format orders
    const formattedOrders = orders?.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      employeeEmail: order.employees?.email || '',
      giftName: order.products?.name || '',
      status: order.status,
      orderDate: order.created_at,
      totalAmount: order.total_amount,
      currency: order.currency,
      // Also include nested structure for backward compatibility
      employee: order.employees ? {
        id: order.employees.id,
        name: `${order.employees.first_name} ${order.employees.last_name}`,
        email: order.employees.email,
      } : null,
      gift: order.products ? {
        id: order.products.id,
        name: order.products.name,
        imageUrl: order.products.image_url,
      } : null,
    })) || [];
    
    console.log(`[Dashboard Recent Orders DB] Returning ${formattedOrders.length} orders`);
    
    return {
      success: true,
      orders: formattedOrders,
      total: formattedOrders.length,
      count: formattedOrders.length,
    };
  } catch (error: any) {
    console.error('[Dashboard Recent Orders DB] Error:', error);
    throw error;
  }
}

/**
 * Get popular gifts for a site
 */
export async function getPopularGifts(siteId: string, limit: number = 5, timeRange: string = '30d') {
  try {
    console.log(`[Dashboard Popular Gifts DB] Fetching for site: ${siteId}, limit: ${limit}, timeRange: ${timeRange}`);
    
    // Calculate date range
    const now = new Date();
    let daysBack = 30;
    
    switch (timeRange) {
      case '7d':
        daysBack = 7;
        break;
      case '30d':
        daysBack = 30;
        break;
      case '90d':
        daysBack = 90;
        break;
      case '1y':
        daysBack = 365;
        break;
    }
    
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    // Get orders with product info, grouped by product
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        product_id,
        products (
          id,
          name,
          image_url,
          price,
          currency
        )
      `)
      .eq('site_id', siteId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());
    
    if (error) throw error;
    
    // Count orders by product
    const productCounts = new Map<string, { product: any; count: number }>();
    
    orders?.forEach(order => {
      if (order.product_id && order.products) {
        const existing = productCounts.get(order.product_id);
        if (existing) {
          existing.count++;
        } else {
          productCounts.set(order.product_id, {
            product: order.products,
            count: 1,
          });
        }
      }
    });
    
    // Convert to array and sort by count
    const sortedProducts = Array.from(productCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    // Calculate total orders for percentage
    const totalOrders = orders?.length || 0;
    
    // Format gifts
    const formattedGifts = sortedProducts.map(item => ({
      giftId: item.product.id,
      giftName: item.product.name,
      orderCount: item.count,
      percentage: calculatePercentage(item.count, totalOrders),
      // Also include other fields for backward compatibility
      id: item.product.id,
      name: item.product.name,
      imageUrl: item.product.image_url,
      price: item.product.price,
      currency: item.product.currency,
    }));
    
    console.log(`[Dashboard Popular Gifts DB] Returning ${formattedGifts.length} popular gifts`);
    
    return {
      success: true,
      gifts: formattedGifts,
      totalOrders,
      timeRange,
    };
  } catch (error: any) {
    console.error('[Dashboard Popular Gifts DB] Error:', error);
    throw error;
  }
}
