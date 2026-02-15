/**
 * Database Access Layer
 * 
 * Provides clean database access functions to replace KV store
 * Uses Supabase client for PostgreSQL queries
 */

import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";
import type {
  Client, CreateClientInput, UpdateClientInput, ClientFilters,
  Site, CreateSiteInput, UpdateSiteInput, SiteFilters,
  Catalog, CreateCatalogInput, UpdateCatalogInput, CatalogFilters,
  Product, CreateProductInput, UpdateProductInput, ProductFilters,
  Employee, CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilters,
  Order, CreateOrderInput, UpdateOrderInput, OrderFilters,
} from './types.ts';

// Get Supabase configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('[DB] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

// Initialize Supabase client
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ==================== Helper Functions ====================

function handleError(operation: string, error: any): never {
  console.error(`[DB] ${operation} failed:`, error);
  throw new Error(`Database operation failed: ${error.message || String(error)}`);
}

// ==================== Clients ====================

export async function getClients(filters?: ClientFilters): Promise<Client[]> {
  try {
    let query = supabase.from('clients').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleError('getClients', error);
    return data || [];
  } catch (error) {
    handleError('getClients', error);
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleError('getClientById', error);
    }
    
    return data;
  } catch (error) {
    handleError('getClientById', error);
  }
}

export async function insertClient(input: CreateClientInput): Promise<Client> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...input,
        id: crypto.randomUUID(),
      })
      .select()
      .single();
    
    if (error) handleError('createClient', error);
    return data;
  } catch (error) {
    handleError('createClient', error);
  }
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError('updateClient', error);
    return data;
  } catch (error) {
    handleError('updateClient', error);
  }
}

export async function deleteClient(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) handleError('deleteClient', error);
  } catch (error) {
    handleError('deleteClient', error);
  }
}


// ==================== Sites ====================

export async function getSites(filters?: SiteFilters): Promise<Site[]> {
  try {
    let query = supabase.from('sites').select('*');
    
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleError('getSites', error);
    return data || [];
  } catch (error) {
    handleError('getSites', error);
  }
}

export async function getSiteById(id: string): Promise<Site | null> {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError('getSiteById', error);
    }
    
    return data;
  } catch (error) {
    handleError('getSiteById', error);
  }
}

export async function getSiteBySlug(slug: string): Promise<Site | null> {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError('getSiteBySlug', error);
    }
    
    return data;
  } catch (error) {
    handleError('getSiteBySlug', error);
  }
}

export async function createSite(input: CreateSiteInput): Promise<Site> {
  try {
    const { data, error } = await supabase
      .from('sites')
      .insert({
        ...input,
        id: crypto.randomUUID(),
      })
      .select()
      .single();
    
    if (error) handleError('createSite', error);
    return data;
  } catch (error) {
    handleError('createSite', error);
  }
}

export async function updateSite(id: string, input: UpdateSiteInput): Promise<Site> {
  try {
    const { data, error } = await supabase
      .from('sites')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError('updateSite', error);
    return data;
  } catch (error) {
    handleError('updateSite', error);
  }
}

export async function deleteSite(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);
    
    if (error) handleError('deleteSite', error);
  } catch (error) {
    handleError('deleteSite', error);
  }
}


// ==================== Catalogs ====================

export async function getCatalogs(filters?: CatalogFilters): Promise<Catalog[]> {
  try {
    let query = supabase.from('catalogs').select('*');
    
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleError('getCatalogs', error);
    return data || [];
  } catch (error) {
    handleError('getCatalogs', error);
  }
}

export async function getCatalogById(id: string): Promise<Catalog | null> {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError('getCatalogById', error);
    }
    
    return data;
  } catch (error) {
    handleError('getCatalogById', error);
  }
}

export async function createCatalog(input: CreateCatalogInput): Promise<Catalog> {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .insert({
        ...input,
        id: crypto.randomUUID(),
      })
      .select()
      .single();
    
    if (error) handleError('createCatalog', error);
    return data;
  } catch (error) {
    handleError('createCatalog', error);
  }
}

export async function updateCatalog(id: string, input: UpdateCatalogInput): Promise<Catalog> {
  try {
    const { data, error } = await supabase
      .from('catalogs')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError('updateCatalog', error);
    return data;
  } catch (error) {
    handleError('updateCatalog', error);
  }
}

export async function deleteCatalog(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('catalogs')
      .delete()
      .eq('id', id);
    
    if (error) handleError('deleteCatalog', error);
  } catch (error) {
    handleError('deleteCatalog', error);
  }
}


// ==================== Products ====================

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  try {
    let query = supabase.from('products').select('*');
    
    if (filters?.catalog_id) {
      query = query.eq('catalog_id', filters.catalog_id);
    }
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }
    
    if (filters?.min_price !== undefined) {
      query = query.gte('price', filters.min_price);
    }
    
    if (filters?.max_price !== undefined) {
      query = query.lte('price', filters.max_price);
    }
    
    if (filters?.in_stock_only) {
      query = query.eq('status', 'active').gt('available_quantity', 0);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleError('getProducts', error);
    return data || [];
  } catch (error) {
    handleError('getProducts', error);
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError('getProductById', error);
    }
    
    return data;
  } catch (error) {
    handleError('getProductById', error);
  }
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError('getProductBySku', error);
    }
    
    return data;
  } catch (error) {
    handleError('getProductBySku', error);
  }
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...input,
        id: crypto.randomUUID(),
        currency: input.currency || 'USD',
      })
      .select()
      .single();
    
    if (error) handleError('createProduct', error);
    return data;
  } catch (error) {
    handleError('createProduct', error);
  }
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError('updateProduct', error);
    return data;
  } catch (error) {
    handleError('updateProduct', error);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) handleError('deleteProduct', error);
  } catch (error) {
    handleError('deleteProduct', error);
  }
}


// ==================== Employees ====================

export async function getEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
  try {
    let query = supabase.from('employees').select('*');
    
    if (filters?.site_id) {
      query = query.eq('site_id', filters.site_id);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.department) {
      query = query.eq('department', filters.department);
    }
    
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_id.ilike.%${filters.search}%`);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleError('getEmployees', error);
    return data || [];
  } catch (error) {
    handleError('getEmployees', error);
  }
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError('getEmployeeById', error);
    }
    
    return data;
  } catch (error) {
    handleError('getEmployeeById', error);
  }
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        ...input,
        id: crypto.randomUUID(),
      })
      .select()
      .single();
    
    if (error) handleError('createEmployee', error);
    return data;
  } catch (error) {
    handleError('createEmployee', error);
  }
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput): Promise<Employee> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError('updateEmployee', error);
    return data;
  } catch (error) {
    handleError('updateEmployee', error);
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) handleError('deleteEmployee', error);
  } catch (error) {
    handleError('deleteEmployee', error);
  }
}


// ==================== Orders ====================

export async function getOrders(filters?: OrderFilters): Promise<Order[]> {
  try {
    let query = supabase.from('orders').select('*');
    
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    
    if (filters?.site_id) {
      query = query.eq('site_id', filters.site_id);
    }
    
    if (filters?.product_id) {
      query = query.eq('product_id', filters.product_id);
    }
    
    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    
    if (filters?.customer_email) {
      query = query.eq('customer_email', filters.customer_email);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.search) {
      query = query.or(`order_number.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,tracking_number.ilike.%${filters.search}%`);
    }
    
    if (filters?.from_date) {
      query = query.gte('created_at', filters.from_date);
    }
    
    if (filters?.to_date) {
      query = query.lte('created_at', filters.to_date);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleError('getOrders', error);
    return data || [];
  } catch (error) {
    handleError('getOrders', error);
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError('getOrderById', error);
    }
    
    return data;
  } catch (error) {
    handleError('getOrderById', error);
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError('getOrderByNumber', error);
    }
    
    return data;
  } catch (error) {
    handleError('getOrderByNumber', error);
  }
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        id: crypto.randomUUID(),
        client_id: input.client_id,
        site_id: input.site_id,
        product_id: input.product_id,
        employee_id: input.employee_id,
        order_number: input.order_number,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_employee_id: input.customer_employee_id,
        status: input.status || 'pending',
        total_amount: input.total_amount,
        currency: input.currency || 'USD',
        shipping_address: input.shipping_address,
        tracking_number: input.tracking_number,
        items: input.items,
        metadata: input.metadata,
        notes: input.notes,
      })
      .select()
      .single();
    
    if (error) handleError('createOrder', error);
    return data;
  } catch (error) {
    handleError('createOrder', error);
  }
}

export async function updateOrder(id: string, input: UpdateOrderInput): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError('updateOrder', error);
    return data;
  } catch (error) {
    handleError('updateOrder', error);
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) handleError('deleteOrder', error);
  } catch (error) {
    handleError('deleteOrder', error);
  }
}

// ==================== Utility Functions ====================

export async function getProductCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);
    
    if (error) handleError('getProductCategories', error);
    
    const categories = new Set(data?.map(p => p.category) || []);
    return Array.from(categories).sort();
  } catch (error) {
    handleError('getProductCategories', error);
  }
}

export async function getOrderStats(filters?: { client_id?: string; site_id?: string; from_date?: string; to_date?: string }) {
  try {
    let query = supabase.from('orders').select('status, total_amount, currency');
    
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    
    if (filters?.site_id) {
      query = query.eq('site_id', filters.site_id);
    }
    
    if (filters?.from_date) {
      query = query.gte('created_at', filters.from_date);
    }
    
    if (filters?.to_date) {
      query = query.lte('created_at', filters.to_date);
    }
    
    const { data, error } = await query;
    
    if (error) handleError('getOrderStats', error);
    
    const stats = {
      total: data?.length || 0,
      pending: data?.filter(o => o.status === 'pending').length || 0,
      confirmed: data?.filter(o => o.status === 'confirmed').length || 0,
      processing: data?.filter(o => o.status === 'processing').length || 0,
      shipped: data?.filter(o => o.status === 'shipped').length || 0,
      delivered: data?.filter(o => o.status === 'delivered').length || 0,
      cancelled: data?.filter(o => o.status === 'cancelled').length || 0,
      totalRevenue: data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
    };
    
    return stats;
  } catch (error) {
    handleError('getOrderStats', error);
  }
}


// ==================== Enhanced Order Functions with Product JOINs ====================

/**
 * Get orders with product details (JOIN)
 * Returns orders with full product information
 */
export async function getOrdersWithProducts(filters?: OrderFilters): Promise<Array<Order & { product: Product }>> {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        product:products(*)
      `);
    
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    
    if (filters?.site_id) {
      query = query.eq('site_id', filters.site_id);
    }
    
    if (filters?.product_id) {
      query = query.eq('product_id', filters.product_id);
    }
    
    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    
    if (filters?.customer_email) {
      query = query.eq('customer_email', filters.customer_email);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.from_date) {
      query = query.gte('created_at', filters.from_date);
    }
    
    if (filters?.to_date) {
      query = query.lte('created_at', filters.to_date);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleError('getOrdersWithProducts', error);
    return data || [];
  } catch (error) {
    handleError('getOrdersWithProducts', error);
  }
}

/**
 * Get single order with product details
 */
export async function getOrderWithProduct(id: string): Promise<(Order & { product: Product }) | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError('getOrderWithProduct', error);
    }
    
    return data;
  } catch (error) {
    handleError('getOrderWithProduct', error);
  }
}

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-XXXXXX (e.g., ORD-20260215-A1B2C3)
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

/**
 * Update order with timeline event
 * Appends new event to metadata.timeline array
 */
export async function updateOrderWithTimeline(
  id: string,
  updates: UpdateOrderInput,
  timelineEvent?: {
    status: string;
    label: string;
    timestamp: string;
    location?: string;
    description: string;
  }
): Promise<Order> {
  try {
    // Get current order to access metadata
    const currentOrder = await getOrderById(id);
    if (!currentOrder) {
      throw new Error('Order not found');
    }
    
    // Update metadata with new timeline event
    const metadata = currentOrder.metadata || {};
    const timeline = metadata.timeline || [];
    
    if (timelineEvent) {
      timeline.push(timelineEvent);
    }
    
    // Update order with new metadata
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        metadata: {
          ...metadata,
          timeline,
        },
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError('updateOrderWithTimeline', error);
    return data;
  } catch (error) {
    handleError('updateOrderWithTimeline', error);
  }
}

/**
 * Get order revenue statistics
 * Returns total revenue, order count, average order value
 */
export async function getOrderRevenue(filters?: {
  client_id?: string;
  site_id?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
}): Promise<{
  total_revenue: number;
  order_count: number;
  average_order_value: number;
  currency: string;
}> {
  try {
    let query = supabase
      .from('orders')
      .select('total_amount, currency, status');
    
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    
    if (filters?.site_id) {
      query = query.eq('site_id', filters.site_id);
    }
    
    if (filters?.from_date) {
      query = query.gte('created_at', filters.from_date);
    }
    
    if (filters?.to_date) {
      query = query.lte('created_at', filters.to_date);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      // Exclude cancelled orders by default
      query = query.neq('status', 'cancelled');
    }
    
    const { data, error } = await query;
    
    if (error) handleError('getOrderRevenue', error);
    
    const orders = data || [];
    const total_revenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const order_count = orders.length;
    const average_order_value = order_count > 0 ? total_revenue / order_count : 0;
    const currency = orders[0]?.currency || 'USD';
    
    return {
      total_revenue,
      order_count,
      average_order_value,
      currency,
    };
  } catch (error) {
    handleError('getOrderRevenue', error);
  }
}


// ==================== Site Catalog Configuration ====================

import type {
  SiteCatalogAssignment, CreateSiteCatalogAssignmentInput, UpdateSiteCatalogAssignmentInput,
  SitePriceOverride, CreateSitePriceOverrideInput, UpdateSitePriceOverrideInput,
  SiteCategoryExclusion, CreateSiteCategoryExclusionInput,
  SiteCatalogConfig,
} from './types.ts';

/**
 * Get all catalog assignments for a site
 */
export async function getSiteCatalogAssignments(siteId: string): Promise<SiteCatalogAssignment[]> {
  try {
    const { data, error } = await supabase
      .from('site_catalog_assignments')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    
    if (error) handleError('getSiteCatalogAssignments', error);
    return data || [];
  } catch (error) {
    handleError('getSiteCatalogAssignments', error);
  }
}

/**
 * Get a specific catalog assignment
 */
export async function getSiteCatalogAssignment(siteId: string, catalogId: string): Promise<SiteCatalogAssignment | null> {
  try {
    const { data, error } = await supabase
      .from('site_catalog_assignments')
      .select('*')
      .eq('site_id', siteId)
      .eq('catalog_id', catalogId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleError('getSiteCatalogAssignment', error);
    }
    
    return data;
  } catch (error) {
    handleError('getSiteCatalogAssignment', error);
  }
}

/**
 * Create a catalog assignment for a site
 */
export async function createSiteCatalogAssignment(input: CreateSiteCatalogAssignmentInput): Promise<SiteCatalogAssignment> {
  try {
    const { data, error } = await supabase
      .from('site_catalog_assignments')
      .insert({
        id: crypto.randomUUID(),
        ...input,
        settings: input.settings || {},
      })
      .select()
      .single();
    
    if (error) handleError('createSiteCatalogAssignment', error);
    return data;
  } catch (error) {
    handleError('createSiteCatalogAssignment', error);
  }
}

/**
 * Update a catalog assignment
 */
export async function updateSiteCatalogAssignment(
  siteId: string,
  catalogId: string,
  input: UpdateSiteCatalogAssignmentInput
): Promise<SiteCatalogAssignment> {
  try {
    const { data, error } = await supabase
      .from('site_catalog_assignments')
      .update(input)
      .eq('site_id', siteId)
      .eq('catalog_id', catalogId)
      .select()
      .single();
    
    if (error) handleError('updateSiteCatalogAssignment', error);
    return data;
  } catch (error) {
    handleError('updateSiteCatalogAssignment', error);
  }
}

/**
 * Delete a catalog assignment
 */
export async function deleteSiteCatalogAssignment(siteId: string, catalogId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('site_catalog_assignments')
      .delete()
      .eq('site_id', siteId)
      .eq('catalog_id', catalogId);
    
    if (error) handleError('deleteSiteCatalogAssignment', error);
  } catch (error) {
    handleError('deleteSiteCatalogAssignment', error);
  }
}

/**
 * Get all price overrides for a site
 */
export async function getSitePriceOverrides(siteId: string): Promise<SitePriceOverride[]> {
  try {
    const { data, error } = await supabase
      .from('site_price_overrides')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    
    if (error) handleError('getSitePriceOverrides', error);
    return data || [];
  } catch (error) {
    handleError('getSitePriceOverrides', error);
  }
}

/**
 * Get a specific price override
 */
export async function getSitePriceOverride(siteId: string, productId: string): Promise<SitePriceOverride | null> {
  try {
    const { data, error } = await supabase
      .from('site_price_overrides')
      .select('*')
      .eq('site_id', siteId)
      .eq('product_id', productId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleError('getSitePriceOverride', error);
    }
    
    return data;
  } catch (error) {
    handleError('getSitePriceOverride', error);
  }
}

/**
 * Create or update a price override
 */
export async function upsertSitePriceOverride(input: CreateSitePriceOverrideInput): Promise<SitePriceOverride> {
  try {
    const { data, error } = await supabase
      .from('site_price_overrides')
      .upsert({
        id: crypto.randomUUID(),
        ...input,
      }, {
        onConflict: 'site_id,product_id',
      })
      .select()
      .single();
    
    if (error) handleError('upsertSitePriceOverride', error);
    return data;
  } catch (error) {
    handleError('upsertSitePriceOverride', error);
  }
}

/**
 * Delete a price override
 */
export async function deleteSitePriceOverride(siteId: string, productId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('site_price_overrides')
      .delete()
      .eq('site_id', siteId)
      .eq('product_id', productId);
    
    if (error) handleError('deleteSitePriceOverride', error);
  } catch (error) {
    handleError('deleteSitePriceOverride', error);
  }
}

/**
 * Get all category exclusions for a site
 */
export async function getSiteCategoryExclusions(siteId: string): Promise<SiteCategoryExclusion[]> {
  try {
    const { data, error } = await supabase
      .from('site_category_exclusions')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    
    if (error) handleError('getSiteCategoryExclusions', error);
    return data || [];
  } catch (error) {
    handleError('getSiteCategoryExclusions', error);
  }
}

/**
 * Create a category exclusion
 */
export async function createSiteCategoryExclusion(input: CreateSiteCategoryExclusionInput): Promise<SiteCategoryExclusion> {
  try {
    const { data, error } = await supabase
      .from('site_category_exclusions')
      .insert({
        id: crypto.randomUUID(),
        ...input,
      })
      .select()
      .single();
    
    if (error) handleError('createSiteCategoryExclusion', error);
    return data;
  } catch (error) {
    handleError('createSiteCategoryExclusion', error);
  }
}

/**
 * Delete a category exclusion
 */
export async function deleteSiteCategoryExclusion(siteId: string, category: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('site_category_exclusions')
      .delete()
      .eq('site_id', siteId)
      .eq('category', category);
    
    if (error) handleError('deleteSiteCategoryExclusion', error);
  } catch (error) {
    handleError('deleteSiteCategoryExclusion', error);
  }
}

// ============================================================================
// SITE PRODUCT EXCLUSIONS
// ============================================================================

/**
 * Get all product exclusions for a site
 */
export async function getSiteProductExclusions(siteId: string): Promise<SiteProductExclusion[]> {
  try {
    const { data, error } = await supabase
      .from('site_product_exclusions')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    
    if (error) handleError('getSiteProductExclusions', error);
    return data || [];
  } catch (error) {
    handleError('getSiteProductExclusions', error);
  }
}

/**
 * Create a product exclusion for a site
 */
export async function createSiteProductExclusion(input: CreateSiteProductExclusionInput): Promise<SiteProductExclusion> {
  try {
    const { data, error } = await supabase
      .from('site_product_exclusions')
      .insert({
        id: crypto.randomUUID(),
        ...input,
      })
      .select()
      .single();
    
    if (error) handleError('createSiteProductExclusion', error);
    return data;
  } catch (error) {
    handleError('createSiteProductExclusion', error);
  }
}

/**
 * Delete a product exclusion
 */
export async function deleteSiteProductExclusion(siteId: string, productId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('site_product_exclusions')
      .delete()
      .eq('site_id', siteId)
      .eq('product_id', productId);
    
    if (error) handleError('deleteSiteProductExclusion', error);
  } catch (error) {
    handleError('deleteSiteProductExclusion', error);
  }
}

/**
 * Get complete site catalog configuration
 * Includes assignments, price overrides, category exclusions, and product exclusions
 */
export async function getSiteCatalogConfig(siteId: string): Promise<SiteCatalogConfig> {
  try {
    const [assignments, priceOverrides, categoryExclusions, productExclusions] = await Promise.all([
      getSiteCatalogAssignments(siteId),
      getSitePriceOverrides(siteId),
      getSiteCategoryExclusions(siteId),
      getSiteProductExclusions(siteId),
    ]);
    
    return {
      siteId,
      assignments,
      priceOverrides,
      categoryExclusions,
      productExclusions,
    };
  } catch (error) {
    handleError('getSiteCatalogConfig', error);
  }
}

/**
 * Get products for a site with price overrides applied
 */
export async function getSiteProductsWithPricing(siteId: string): Promise<Array<Product & { effective_price: number; has_override: boolean }>> {
  try {
    // This is a complex query that joins multiple tables
    // Using raw SQL for better performance
    const { data, error } = await supabase.rpc('get_site_products_with_pricing', {
      p_site_id: siteId,
    });
    
    if (error) handleError('getSiteProductsWithPricing', error);
    return data || [];
  } catch (error) {
    handleError('getSiteProductsWithPricing', error);
  }
}
