/**
 * CRUD Operations - Database Version
 * 
 * Provides CRUD operations for all entities using PostgreSQL database
 * Replaces KV store operations with database queries
 */

import * as db from './database/db.ts';
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
    
    return {
      success: true,
      data: clients,
      total: clients.length,
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
    
    return {
      success: true,
      data: client,
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
    
    return {
      success: true,
      data: sites,
      total: sites.length,
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
    
    return {
      success: true,
      data: site,
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
    
    return {
      success: true,
      data: site,
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
    
    return {
      success: true,
      data: products,
      total: products.length,
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
    
    return {
      success: true,
      data: product,
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
    
    return {
      success: true,
      data: employees,
      total: employees.length,
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
    
    return {
      success: true,
      data: employee,
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
    
    return {
      success: true,
      data: orders,
      total: orders.length,
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
    
    return {
      success: true,
      data: order,
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
    
    return {
      success: true,
      data: order,
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
