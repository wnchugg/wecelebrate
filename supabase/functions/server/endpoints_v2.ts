/**
 * V2 Endpoints - Database-Backed
 * 
 * New endpoints that use PostgreSQL database instead of KV store
 * These can be added to index.tsx to gradually replace KV endpoints
 */

import type { Context } from "https://deno.land/x/hono@v3.12.11/mod.ts";

// Import CRUD functions
import * as crudDb from './crud_db.ts';

// ==================== CLIENTS ====================

export async function getClientsV2(c: Context) {
  try {
    const filters = {
      status: c.req.query('status'),
      search: c.req.query('search'),
      limit: parseInt(c.req.query('limit') || '50'),
      offset: parseInt(c.req.query('offset') || '0'),
    };
    
    const result = await crudDb.getClients(filters);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function getClientByIdV2(c: Context) {
  try {
    const id = c.req.param('id');
    const result = await crudDb.getClientById(id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function createClientV2(c: Context) {
  try {
    const input = await c.req.json();
    const result = await crudDb.createClient(input);
    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function updateClientV2(c: Context) {
  try {
    const id = c.req.param('id');
    const input = await c.req.json();
    const result = await crudDb.updateClient(id, input);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function deleteClientV2(c: Context) {
  try {
    const id = c.req.param('id');
    const result = await crudDb.deleteClient(id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

// ==================== SITES ====================

export async function getSitesV2(c: Context) {
  try {
    const filters = {
      client_id: c.req.query('client_id'),
      status: c.req.query('status'),
      search: c.req.query('search'),
      limit: parseInt(c.req.query('limit') || '50'),
      offset: parseInt(c.req.query('offset') || '0'),
    };
    
    const result = await crudDb.getSites(filters);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function getSiteByIdV2(c: Context) {
  try {
    const id = c.req.param('id');
    const result = await crudDb.getSiteById(id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function getSiteBySlugV2(c: Context) {
  try {
    const slug = c.req.param('slug');
    const result = await crudDb.getSiteBySlug(slug);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function createSiteV2(c: Context) {
  try {
    const input = await c.req.json();
    const result = await crudDb.createSite(input);
    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function updateSiteV2(c: Context) {
  try {
    const id = c.req.param('id');
    const input = await c.req.json();
    const result = await crudDb.updateSite(id, input);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function deleteSiteV2(c: Context) {
  try {
    const id = c.req.param('id');
    const result = await crudDb.deleteSite(id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

// ==================== PRODUCTS ====================

export async function getProductsV2(c: Context) {
  try {
    const filters = {
      catalog_id: c.req.query('catalog_id'),
      category: c.req.query('category'),
      status: c.req.query('status'),
      search: c.req.query('search'),
      min_price: c.req.query('min_price') ? parseFloat(c.req.query('min_price')!) : undefined,
      max_price: c.req.query('max_price') ? parseFloat(c.req.query('max_price')!) : undefined,
      in_stock_only: c.req.query('in_stock_only') === 'true',
      limit: parseInt(c.req.query('limit') || '50'),
      offset: parseInt(c.req.query('offset') || '0'),
    };
    
    const result = await crudDb.getProducts(filters);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function getProductByIdV2(c: Context) {
  try {
    const id = c.req.param('id');
    const result = await crudDb.getProductById(id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function createProductV2(c: Context) {
  try {
    const input = await c.req.json();
    const result = await crudDb.createProduct(input);
    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function updateProductV2(c: Context) {
  try {
    const id = c.req.param('id');
    const input = await c.req.json();
    const result = await crudDb.updateProduct(id, input);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function deleteProductV2(c: Context) {
  try {
    const id = c.req.param('id');
    const result = await crudDb.deleteProduct(id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

// ==================== EMPLOYEES ====================

export async function getEmployeesV2(c: Context) {
  try {
    const filters = {
      site_id: c.req.query('site_id'),
      status: c.req.query('status'),
      department: c.req.query('department'),
      search: c.req.query('search'),
      limit: parseInt(c.req.query('limit') || '50'),
      offset: parseInt(c.req.query('offset') || '0'),
    };
    
    const result = await crudDb.getEmployees(filters);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function getEmployeeByIdV2(c: Context) {
  try {
    const id = c.req.param('id');
    const result = await crudDb.getEmployeeById(id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function createEmployeeV2(c: Context) {
  try {
    const input = await c.req.json();
    const result = await crudDb.createEmployee(input);
    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function updateEmployeeV2(c: Context) {
  try {
    const id = c.req.param('id');
    const input = await c.req.json();
    const result = await crudDb.updateEmployee(id, input);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function deleteEmployeeV2(c: Context) {
  try {
    const id = c.req.param('id');
    const result = await crudDb.deleteEmployee(id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

// ==================== ORDERS ====================

export async function getOrdersV2(c: Context) {
  try {
    const filters = {
      client_id: c.req.query('client_id'),
      site_id: c.req.query('site_id'),
      product_id: c.req.query('product_id'),
      employee_id: c.req.query('employee_id'),
      customer_email: c.req.query('customer_email'),
      status: c.req.query('status'),
      search: c.req.query('search'),
      from_date: c.req.query('from_date'),
      to_date: c.req.query('to_date'),
      limit: parseInt(c.req.query('limit') || '50'),
      offset: parseInt(c.req.query('offset') || '0'),
    };
    
    const result = await crudDb.getOrders(filters);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function getOrderByIdV2(c: Context) {
  try {
    const id = c.req.param('id');
    const result = await crudDb.getOrderById(id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function getOrderByNumberV2(c: Context) {
  try {
    const orderNumber = c.req.param('orderNumber');
    const result = await crudDb.getOrderByNumber(orderNumber);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function createOrderV2(c: Context) {
  try {
    const input = await c.req.json();
    const result = await crudDb.createOrder(input);
    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function updateOrderV2(c: Context) {
  try {
    const id = c.req.param('id');
    const input = await c.req.json();
    const result = await crudDb.updateOrder(id, input);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function deleteOrderV2(c: Context) {
  try {
    const id = c.req.param('id');
    const result = await crudDb.deleteOrder(id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

// ==================== UTILITIES ====================

export async function getProductCategoriesV2(c: Context) {
  try {
    const result = await crudDb.getProductCategories();
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

export async function getOrderStatsV2(c: Context) {
  try {
    const filters = {
      client_id: c.req.query('client_id'),
      site_id: c.req.query('site_id'),
      from_date: c.req.query('from_date'),
      to_date: c.req.query('to_date'),
    };
    
    const result = await crudDb.getOrderStats(filters);
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}
