/**
 * CRUD Operations - Database Version
 * 
 * Provides CRUD operations for all entities using PostgreSQL database
 * Replaces KV store operations with database queries
 */

import * as db from './database/db.ts';
import { objectToCamelCase } from './helpers.ts';
import type {
  Client, CreateClientInput, UpdateClientInput,
  Site, CreateSiteInput, UpdateSiteInput,
  Product, CreateProductInput, UpdateProductInput,
  Employee, CreateEmployeeInput, UpdateEmployeeInput,
  Order, CreateOrderInput, UpdateOrderInput,
} from './database/types.ts';

// ==================== CLIENTS ====================

/**
 * Get all clients
 */
export async function getClients(filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    console.log('[CRUD DB] Getting clients with filters:', filters);
    const clients = await db.getClients(filters);
    
    // Transform snake_case to camelCase for frontend
    const transformedClients = clients.map(client => objectToCamelCase(client));
    
    return {
      success: true,
      data: transformedClients,
      total: transformedClients.length,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting clients:', error);
    throw error;
  }
}

/**
 * Get client by ID
 */
export async function getClientById(id: string) {
  try {
    console.log('[CRUD DB] Getting client:', id);
    const client = await db.getClientById(id);
    
    if (!client) {
      return {
        success: false,
        error: 'Client not found',
      };
    }
    
    // Transform snake_case to camelCase for frontend
    const transformedClient = objectToCamelCase(client);
    
    return {
      success: true,
      data: transformedClient,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting client:', error);
    throw error;
  }
}

/**
 * Create client
 */
export async function createClient(input: Omit<CreateClientInput, 'id'>) {
  try {
    console.log('[CRUD DB] Creating client:', input.name);
    const client = await db.insertClient(input as CreateClientInput);
    
    return {
      success: true,
      data: client,
      message: 'Client created successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error creating client:', error);
    throw error;
  }
}

/**
 * Update client
 */
export async function updateClient(id: string, input: UpdateClientInput) {
  try {
    console.log('[CRUD DB] Updating client:', id);
    const client = await db.updateClient(id, input);
    
    return {
      success: true,
      data: client,
      message: 'Client updated successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error updating client:', error);
    throw error;
  }
}

/**
 * Delete client
 */
export async function deleteClient(id: string) {
  try {
    console.log('[CRUD DB] Deleting client:', id);
    await db.deleteClient(id);
    
    return {
      success: true,
      message: 'Client deleted successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error deleting client:', error);
    throw error;
  }
}

// ==================== SITES ====================

/**
 * Get all sites
 */
export async function getSites(filters?: {
  client_id?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    console.log('[CRUD DB] Getting sites with filters:', filters);
    const sites = await db.getSites(filters);
    
    // Transform snake_case to camelCase for frontend
    const transformedSites = sites.map(site => objectToCamelCase(site));
    
    return {
      success: true,
      data: transformedSites,
      total: transformedSites.length,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting sites:', error);
    throw error;
  }
}

/**
 * Get site by ID
 */
export async function getSiteById(id: string) {
  try {
    console.log('[CRUD DB] Getting site:', id);
    const site = await db.getSiteById(id);
    
    if (!site) {
      return {
        success: false,
        error: 'Site not found',
      };
    }
    
    // Transform snake_case to camelCase for frontend
    const transformedSite = objectToCamelCase(site);
    
    return {
      success: true,
      data: transformedSite,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting site:', error);
    throw error;
  }
}

/**
 * Get site by slug
 */
export async function getSiteBySlug(slug: string) {
  try {
    console.log('[CRUD DB] Getting site by slug:', slug);
    const site = await db.getSiteBySlug(slug);
    
    if (!site) {
      return {
        success: false,
        error: 'Site not found',
      };
    }
    
    // Transform snake_case to camelCase for frontend
    const transformedSite = objectToCamelCase(site);
    
    return {
      success: true,
      data: transformedSite,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting site by slug:', error);
    throw error;
  }
}

/**
 * Create site
 */
export async function createSite(input: Omit<CreateSiteInput, 'id'>) {
  try {
    console.log('[CRUD DB] Creating site:', input.name);
    const site = await db.createSite(input as CreateSiteInput);
    
    return {
      success: true,
      data: site,
      message: 'Site created successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error creating site:', error);
    throw error;
  }
}

/**
 * Update site
 */
export async function updateSite(id: string, input: UpdateSiteInput) {
  try {
    console.log('[CRUD DB] Updating site:', id);
    const site = await db.updateSite(id, input);
    
    return {
      success: true,
      data: site,
      message: 'Site updated successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error updating site:', error);
    throw error;
  }
}

/**
 * Delete site
 */
export async function deleteSite(id: string) {
  try {
    console.log('[CRUD DB] Deleting site:', id);
    await db.deleteSite(id);
    
    return {
      success: true,
      message: 'Site deleted successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error deleting site:', error);
    throw error;
  }
}

// ==================== PRODUCTS ====================

/**
 * Get all products
 */
export async function getProducts(filters?: {
  catalog_id?: string;
  category?: string;
  status?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  limit?: number;
  offset?: number;
}) {
  try {
    console.log('[CRUD DB] Getting products with filters:', filters);
    const products = await db.getProducts(filters);
    
    // Transform snake_case to camelCase for frontend
    const transformedProducts = products.map(product => objectToCamelCase(product));
    
    return {
      success: true,
      data: transformedProducts,
      total: transformedProducts.length,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting products:', error);
    throw error;
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id: string) {
  try {
    console.log('[CRUD DB] Getting product:', id);
    const product = await db.getProductById(id);
    
    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }
    
    // Transform snake_case to camelCase for frontend
    const transformedProduct = objectToCamelCase(product);
    
    return {
      success: true,
      data: transformedProduct,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting product:', error);
    throw error;
  }
}

/**
 * Create product
 */
export async function createProduct(input: Omit<CreateProductInput, 'id'>) {
  try {
    console.log('[CRUD DB] Creating product:', input.name);
    const product = await db.createProduct(input as CreateProductInput);
    
    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error creating product:', error);
    throw error;
  }
}

/**
 * Update product
 */
export async function updateProduct(id: string, input: UpdateProductInput) {
  try {
    console.log('[CRUD DB] Updating product:', id);
    const product = await db.updateProduct(id, input);
    
    return {
      success: true,
      data: product,
      message: 'Product updated successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error updating product:', error);
    throw error;
  }
}

/**
 * Delete product
 */
export async function deleteProduct(id: string) {
  try {
    console.log('[CRUD DB] Deleting product:', id);
    await db.deleteProduct(id);
    
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error deleting product:', error);
    throw error;
  }
}

// ==================== EMPLOYEES ====================

/**
 * Get all employees
 */
export async function getEmployees(filters?: {
  site_id?: string;
  status?: string;
  department?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    console.log('[CRUD DB] Getting employees with filters:', filters);
    const employees = await db.getEmployees(filters);
    
    // Transform snake_case to camelCase for frontend
    const transformedEmployees = employees.map(employee => objectToCamelCase(employee));
    
    return {
      success: true,
      data: transformedEmployees,
      total: transformedEmployees.length,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting employees:', error);
    throw error;
  }
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(id: string) {
  try {
    console.log('[CRUD DB] Getting employee:', id);
    const employee = await db.getEmployeeById(id);
    
    if (!employee) {
      return {
        success: false,
        error: 'Employee not found',
      };
    }
    
    // Transform snake_case to camelCase for frontend
    const transformedEmployee = objectToCamelCase(employee);
    
    return {
      success: true,
      data: transformedEmployee,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting employee:', error);
    throw error;
  }
}

/**
 * Create employee
 */
export async function createEmployee(input: Omit<CreateEmployeeInput, 'id'>) {
  try {
    console.log('[CRUD DB] Creating employee:', input.employee_id);
    const employee = await db.createEmployee(input as CreateEmployeeInput);
    
    return {
      success: true,
      data: employee,
      message: 'Employee created successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error creating employee:', error);
    throw error;
  }
}

/**
 * Update employee
 */
export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  try {
    console.log('[CRUD DB] Updating employee:', id);
    const employee = await db.updateEmployee(id, input);
    
    return {
      success: true,
      data: employee,
      message: 'Employee updated successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error updating employee:', error);
    throw error;
  }
}

/**
 * Delete employee
 */
export async function deleteEmployee(id: string) {
  try {
    console.log('[CRUD DB] Deleting employee:', id);
    await db.deleteEmployee(id);
    
    return {
      success: true,
      message: 'Employee deleted successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error deleting employee:', error);
    throw error;
  }
}

// ==================== ORDERS ====================

/**
 * Get all orders
 */
export async function getOrders(filters?: {
  client_id?: string;
  site_id?: string;
  product_id?: string;
  employee_id?: string;
  customer_email?: string;
  status?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    console.log('[CRUD DB] Getting orders with filters:', filters);
    const orders = await db.getOrders(filters);
    
    // Transform snake_case to camelCase for frontend
    const transformedOrders = orders.map(order => objectToCamelCase(order));
    
    return {
      success: true,
      data: transformedOrders,
      total: transformedOrders.length,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting orders:', error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string) {
  try {
    console.log('[CRUD DB] Getting order:', id);
    const order = await db.getOrderById(id);
    
    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }
    
    // Transform snake_case to camelCase for frontend
    const transformedOrder = objectToCamelCase(order);
    
    return {
      success: true,
      data: transformedOrder,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting order:', error);
    throw error;
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string) {
  try {
    console.log('[CRUD DB] Getting order by number:', orderNumber);
    const order = await db.getOrderByNumber(orderNumber);
    
    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }
    
    // Transform snake_case to camelCase for frontend
    const transformedOrder = objectToCamelCase(order);
    
    return {
      success: true,
      data: transformedOrder,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting order by number:', error);
    throw error;
  }
}

/**
 * Create order
 */
export async function createOrder(input: Omit<CreateOrderInput, 'id'>) {
  try {
    console.log('[CRUD DB] Creating order:', input.order_number);
    
    // Generate order number if not provided
    if (!input.order_number) {
      input.order_number = db.generateOrderNumber();
    }
    
    const order = await db.createOrder(input as CreateOrderInput);
    
    return {
      success: true,
      data: order,
      message: 'Order created successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error creating order:', error);
    throw error;
  }
}

/**
 * Update order
 */
export async function updateOrder(id: string, input: UpdateOrderInput) {
  try {
    console.log('[CRUD DB] Updating order:', id);
    const order = await db.updateOrder(id, input);
    
    return {
      success: true,
      data: order,
      message: 'Order updated successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error updating order:', error);
    throw error;
  }
}

/**
 * Delete order
 */
export async function deleteOrder(id: string) {
  try {
    console.log('[CRUD DB] Deleting order:', id);
    await db.deleteOrder(id);
    
    return {
      success: true,
      message: 'Order deleted successfully',
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error deleting order:', error);
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get product categories
 */
export async function getProductCategories() {
  try {
    console.log('[CRUD DB] Getting product categories');
    const categories = await db.getProductCategories();
    
    return {
      success: true,
      categories,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting categories:', error);
    throw error;
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats(filters?: {
  client_id?: string;
  site_id?: string;
  from_date?: string;
  to_date?: string;
}) {
  try {
    console.log('[CRUD DB] Getting order stats with filters:', filters);
    const stats = await db.getOrderStats(filters);
    
    return {
      success: true,
      stats,
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting order stats:', error);
    throw error;
  }
}


// ==================== SITE GIFT CONFIGURATION ====================

/**
 * Get site gift configuration
 */
export async function getSiteGiftConfig(siteId: string) {
  try {
    console.log('[CRUD DB] Getting site gift config for site:', siteId);
    const { data, error } = await db.supabase
      .from('site_gift_configs')
      .select('*')
      .eq('site_id', siteId)
      .single();
    
    if (error && error.code !== 'PGRST116') {  // PGRST116 = not found
      throw error;
    }
    
    // Return default config if not found
    if (!data) {
      return {
        site_id: siteId,
        assignment_strategy: 'all',
        selected_product_ids: [],
        excluded_product_ids: [],
        included_categories: [],
        excluded_categories: [],
        filters: {}
      };
    }
    
    return objectToCamelCase(data);
  } catch (error: any) {
    console.error('[CRUD DB] Error getting site gift config:', error);
    throw error;
  }
}

/**
 * Update site gift configuration
 */
export async function updateSiteGiftConfig(siteId: string, config: any) {
  try {
    console.log('[CRUD DB] Updating site gift config for site:', siteId);
    
    const { data, error } = await db.supabase
      .from('site_gift_configs')
      .upsert({
        site_id: siteId,
        assignment_strategy: config.assignmentStrategy || config.assignment_strategy || 'all',
        selected_product_ids: config.selectedProductIds || config.selected_product_ids || [],
        excluded_product_ids: config.excludedProductIds || config.excluded_product_ids || [],
        included_categories: config.includedCategories || config.included_categories || [],
        excluded_categories: config.excludedCategories || config.excluded_categories || [],
        min_price: config.minPrice || config.min_price,
        max_price: config.maxPrice || config.max_price,
        filters: config.filters || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return objectToCamelCase(data);
  } catch (error: any) {
    console.error('[CRUD DB] Error updating site gift config:', error);
    throw error;
  }
}

/**
 * Get filtered gifts/products for a site
 */
export async function getSiteGifts(siteId: string, filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    console.log('[CRUD DB] Getting site gifts for site:', siteId, 'with filters:', filters);
    
    // Get site to find catalog_id
    const { data: site, error: siteError } = await db.supabase
      .from('sites')
      .select('catalog_id')
      .eq('id', siteId)
      .single();
    
    if (siteError) throw siteError;
    
    if (!site?.catalog_id) {
      console.log('[CRUD DB] Site has no catalog assigned');
      return { success: true, data: [], total: 0 };
    }
    
    // Get site gift configuration
    const config = await getSiteGiftConfig(siteId);
    
    // Build query
    let query = db.supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('catalog_id', site.catalog_id)
      .eq('status', 'active');
    
    // Apply configuration filters
    if (config.assignmentStrategy === 'selected' && config.selectedProductIds?.length > 0) {
      query = query.in('id', config.selectedProductIds);
    }
    
    if (config.excludedProductIds?.length > 0) {
      query = query.not('id', 'in', `(${config.excludedProductIds.join(',')})`);
    }
    
    if (config.includedCategories?.length > 0) {
      query = query.in('category', config.includedCategories);
    }
    
    if (config.excludedCategories?.length > 0) {
      query = query.not('category', 'in', `(${config.excludedCategories.join(',')})`);
    }
    
    if (config.minPrice) {
      query = query.gte('price', config.minPrice);
    }
    
    if (config.maxPrice) {
      query = query.lte('price', config.maxPrice);
    }
    
    // Apply additional filters from request
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const transformedData = (data || []).map(product => objectToCamelCase(product));
    
    return {
      success: true,
      data: transformedData,
      total: count || 0
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting site gifts:', error);
    throw error;
  }
}

// ==================== BRANDS ====================

/**
 * Get all brands
 */
export async function getBrands(filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    console.log('[CRUD DB] Getting brands with filters:', filters);
    
    let query = db.supabase
      .from('brands')
      .select('*', { count: 'exact' });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    query = query.order('name', { ascending: true });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const transformedData = (data || []).map(brand => objectToCamelCase(brand));
    
    return {
      success: true,
      data: transformedData,
      total: count || 0
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting brands:', error);
    throw error;
  }
}

/**
 * Get brand by ID
 */
export async function getBrandById(id: string) {
  try {
    console.log('[CRUD DB] Getting brand by ID:', id);
    
    const { data, error } = await db.supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return objectToCamelCase(data);
  } catch (error: any) {
    console.error('[CRUD DB] Error getting brand:', error);
    throw error;
  }
}

/**
 * Create brand
 */
export async function createBrand(input: any) {
  try {
    console.log('[CRUD DB] Creating brand:', input);
    
    const { data, error } = await db.supabase
      .from('brands')
      .insert({
        name: input.name,
        description: input.description,
        logo_url: input.logoUrl || input.logo_url,
        settings: input.settings || {},
        primary_color: input.primaryColor || input.primary_color,
        secondary_color: input.secondaryColor || input.secondary_color,
        status: input.status || 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return objectToCamelCase(data);
  } catch (error: any) {
    console.error('[CRUD DB] Error creating brand:', error);
    throw error;
  }
}

/**
 * Update brand
 */
export async function updateBrand(id: string, updates: any) {
  try {
    console.log('[CRUD DB] Updating brand:', id, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.logoUrl !== undefined || updates.logo_url !== undefined) {
      updateData.logo_url = updates.logoUrl || updates.logo_url;
    }
    if (updates.settings !== undefined) updateData.settings = updates.settings;
    if (updates.primaryColor !== undefined || updates.primary_color !== undefined) {
      updateData.primary_color = updates.primaryColor || updates.primary_color;
    }
    if (updates.secondaryColor !== undefined || updates.secondary_color !== undefined) {
      updateData.secondary_color = updates.secondaryColor || updates.secondary_color;
    }
    if (updates.status !== undefined) updateData.status = updates.status;
    
    const { data, error } = await db.supabase
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return objectToCamelCase(data);
  } catch (error: any) {
    console.error('[CRUD DB] Error updating brand:', error);
    throw error;
  }
}

/**
 * Delete brand
 */
export async function deleteBrand(id: string) {
  try {
    console.log('[CRUD DB] Deleting brand:', id);
    
    const { error } = await db.supabase
      .from('brands')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('[CRUD DB] Error deleting brand:', error);
    throw error;
  }
}

// ==================== EMAIL TEMPLATES ====================

/**
 * Get all email templates
 */
export async function getEmailTemplates(filters?: {
  templateType?: string;
  eventType?: string;
  siteId?: string;
  clientId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    console.log('[CRUD DB] Getting email templates with filters:', filters);
    
    let query = db.supabase
      .from('email_templates')
      .select('*', { count: 'exact' });
    
    if (filters?.templateType) {
      query = query.eq('template_type', filters.templateType);
    }
    
    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    
    if (filters?.siteId) {
      query = query.eq('site_id', filters.siteId);
    }
    
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    query = query.order('name', { ascending: true });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const transformedData = (data || []).map(template => objectToCamelCase(template));
    
    return {
      success: true,
      data: transformedData,
      total: count || 0
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting email templates:', error);
    throw error;
  }
}

/**
 * Get email template by ID
 */
export async function getEmailTemplateById(id: string) {
  try {
    console.log('[CRUD DB] Getting email template by ID:', id);
    
    const { data, error } = await db.supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return objectToCamelCase(data);
  } catch (error: any) {
    console.error('[CRUD DB] Error getting email template:', error);
    throw error;
  }
}

/**
 * Create email template
 */
export async function createEmailTemplate(input: any) {
  try {
    console.log('[CRUD DB] Creating email template:', input);
    
    const { data, error } = await db.supabase
      .from('email_templates')
      .insert({
        site_id: input.siteId || input.site_id,
        client_id: input.clientId || input.client_id,
        name: input.name,
        description: input.description,
        template_type: input.templateType || input.template_type,
        event_type: input.eventType || input.event_type,
        subject: input.subject,
        body_html: input.bodyHtml || input.body_html,
        body_text: input.bodyText || input.body_text,
        variables: input.variables || [],
        from_name: input.fromName || input.from_name,
        from_email: input.fromEmail || input.from_email,
        reply_to: input.replyTo || input.reply_to,
        status: input.status || 'active',
        is_default: input.isDefault || input.is_default || false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return objectToCamelCase(data);
  } catch (error: any) {
    console.error('[CRUD DB] Error creating email template:', error);
    throw error;
  }
}

/**
 * Update email template
 */
export async function updateEmailTemplate(id: string, updates: any) {
  try {
    console.log('[CRUD DB] Updating email template:', id, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.bodyHtml !== undefined || updates.body_html !== undefined) {
      updateData.body_html = updates.bodyHtml || updates.body_html;
    }
    if (updates.bodyText !== undefined || updates.body_text !== undefined) {
      updateData.body_text = updates.bodyText || updates.body_text;
    }
    if (updates.variables !== undefined) updateData.variables = updates.variables;
    if (updates.fromName !== undefined || updates.from_name !== undefined) {
      updateData.from_name = updates.fromName || updates.from_name;
    }
    if (updates.fromEmail !== undefined || updates.from_email !== undefined) {
      updateData.from_email = updates.fromEmail || updates.from_email;
    }
    if (updates.replyTo !== undefined || updates.reply_to !== undefined) {
      updateData.reply_to = updates.replyTo || updates.reply_to;
    }
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.isDefault !== undefined || updates.is_default !== undefined) {
      updateData.is_default = updates.isDefault || updates.is_default;
    }
    
    const { data, error } = await db.supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return objectToCamelCase(data);
  } catch (error: any) {
    console.error('[CRUD DB] Error updating email template:', error);
    throw error;
  }
}

/**
 * Delete email template
 */
export async function deleteEmailTemplate(id: string) {
  try {
    console.log('[CRUD DB] Deleting email template:', id);
    
    const { error } = await db.supabase
      .from('email_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('[CRUD DB] Error deleting email template:', error);
    throw error;
  }
}


// ==================== BRANDING HELPERS ====================

/**
 * Get effective branding for a site
 * Combines brand template + client overrides + site overrides
 */
export async function getSiteEffectiveBranding(siteId: string) {
  try {
    console.log('[CRUD DB] Getting effective branding for site:', siteId);
    
    // Get site with client and brand data
    const { data: site, error: siteError } = await db.supabase
      .from('sites')
      .select(`
        *,
        client:clients!inner(
          id,
          name,
          default_brand_id,
          branding_overrides,
          header_footer_config
        )
      `)
      .eq('id', siteId)
      .single();
    
    if (siteError) throw siteError;
    if (!site) throw new Error('Site not found');
    
    // Determine which brand to use (site brand or client default brand)
    const brandId = site.brand_id || site.client.default_brand_id;
    
    let brandTemplate = null;
    if (brandId) {
      const { data: brand, error: brandError } = await db.supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();
      
      if (!brandError && brand) {
        brandTemplate = objectToCamelCase(brand);
      }
    }
    
    // Build effective branding by layering:
    // 1. Brand template (base)
    // 2. Client overrides
    // 3. Site overrides
    const effectiveBranding = {
      ...(brandTemplate || {}),
      ...(site.client.branding_overrides || {}),
      ...(site.branding_overrides || {}),
    };
    
    return {
      success: true,
      data: {
        site: objectToCamelCase(site),
        brand: brandTemplate,
        clientOverrides: site.client.branding_overrides || {},
        siteOverrides: site.branding_overrides || {},
        effectiveBranding,
        headerFooterConfig: site.client.header_footer_config || {},
      }
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting effective branding:', error);
    throw error;
  }
}

/**
 * Get effective branding for a client
 * Combines brand template + client overrides
 */
export async function getClientEffectiveBranding(clientId: string) {
  try {
    console.log('[CRUD DB] Getting effective branding for client:', clientId);
    
    const { data: client, error: clientError } = await db.supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (clientError) throw clientError;
    if (!client) throw new Error('Client not found');
    
    let brandTemplate = null;
    if (client.default_brand_id) {
      const { data: brand, error: brandError } = await db.supabase
        .from('brands')
        .select('*')
        .eq('id', client.default_brand_id)
        .single();
      
      if (!brandError && brand) {
        brandTemplate = objectToCamelCase(brand);
      }
    }
    
    const effectiveBranding = {
      ...(brandTemplate || {}),
      ...(client.branding_overrides || {}),
    };
    
    return {
      success: true,
      data: {
        client: objectToCamelCase(client),
        brand: brandTemplate,
        clientOverrides: client.branding_overrides || {},
        effectiveBranding,
        headerFooterConfig: client.header_footer_config || {},
      }
    };
  } catch (error: any) {
    console.error('[CRUD DB] Error getting effective branding:', error);
    throw error;
  }
}
