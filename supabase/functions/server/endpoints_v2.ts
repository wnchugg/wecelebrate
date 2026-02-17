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

// Public endpoint: Get active sites (no auth required)
export async function getPublicSitesV2(c: Context) {
  try {
    console.log('[Public Sites V2] Fetching active sites from database');
    
    // Get only active sites
    const result = await crudDb.getSites({ status: 'active', limit: 100, offset: 0 });
    
    if (!result.success || !result.data) {
      return c.json({ success: false, error: 'Failed to fetch sites' }, 500);
    }
    
    // Transform to public site format (remove sensitive fields)
    const publicSites = result.data.map((site: any) => ({
      id: site.id,
      name: site.name,
      clientId: site.clientId,
      domain: site.slug, // Using slug as domain
      status: site.status || 'active',
      branding: site.branding || {},
      settings: site.settings || {},
      siteUrl: site.siteCustomDomainUrl,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    }));
    
    console.log('[Public Sites V2] Returning', publicSites.length, 'active sites');
    
    return c.json({ sites: publicSites });
  } catch (error: any) {
    console.error('[Public Sites V2] Error:', error);
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


// ==================== SITE GIFT CONFIGURATION ====================

/**
 * Get site gift configuration
 */
export async function getSiteGiftConfigV2(c: any) {
  try {
    const siteId = c.req.param('siteId');
    const config = await crudDb.getSiteGiftConfig(siteId);
    
    return c.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error('[Get Site Gift Config V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

/**
 * Update site gift configuration
 */
export async function updateSiteGiftConfigV2(c: any) {
  try {
    const siteId = c.req.param('siteId');
    const updates = await c.req.json();
    
    const config = await crudDb.updateSiteGiftConfig(siteId, updates);
    
    return c.json({ success: true, data: config });
  } catch (error: any) {
    console.error('[Update Site Gift Config V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

/**
 * Get filtered gifts for a site
 */
export async function getSiteGiftsV2(c: any) {
  try {
    const siteId = c.req.param('siteId');
    
    // Parse query parameters
    const category = c.req.query('category');
    const minPrice = c.req.query('minPrice') ? parseFloat(c.req.query('minPrice')) : undefined;
    const maxPrice = c.req.query('maxPrice') ? parseFloat(c.req.query('maxPrice')) : undefined;
    const search = c.req.query('search');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')) : 50;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')) : 0;
    
    const result = await crudDb.getSiteGifts(siteId, {
      category,
      minPrice,
      maxPrice,
      search,
      limit,
      offset
    });
    
    return c.json(result);
  } catch (error: any) {
    console.error('[Get Site Gifts V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

// ==================== BRANDS ====================

/**
 * Get all brands
 */
export async function getBrandsV2(c: any) {
  try {
    const status = c.req.query('status');
    const search = c.req.query('search');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')) : 50;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')) : 0;
    
    const result = await crudDb.getBrands({ status, search, limit, offset });
    
    return c.json(result);
  } catch (error: any) {
    console.error('[Get Brands V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

/**
 * Get brand by ID
 */
export async function getBrandByIdV2(c: any) {
  try {
    const id = c.req.param('id');
    const brand = await crudDb.getBrandById(id);
    
    return c.json({ success: true, data: brand });
  } catch (error: any) {
    console.error('[Get Brand By ID V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

/**
 * Create brand
 */
export async function createBrandV2(c: any) {
  try {
    const input = await c.req.json();
    const brand = await crudDb.createBrand(input);
    
    return c.json({ success: true, data: brand }, 201);
  } catch (error: any) {
    console.error('[Create Brand V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

/**
 * Update brand
 */
export async function updateBrandV2(c: any) {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const brand = await crudDb.updateBrand(id, updates);
    
    return c.json({ success: true, data: brand });
  } catch (error: any) {
    console.error('[Update Brand V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

/**
 * Delete brand
 */
export async function deleteBrandV2(c: any) {
  try {
    const id = c.req.param('id');
    await crudDb.deleteBrand(id);
    
    return c.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    console.error('[Delete Brand V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

// ==================== EMAIL TEMPLATES ====================

/**
 * Get all email templates
 */
export async function getEmailTemplatesV2(c: any) {
  try {
    const templateType = c.req.query('templateType') || c.req.query('template_type');
    const eventType = c.req.query('eventType') || c.req.query('event_type');
    const siteId = c.req.query('siteId') || c.req.query('site_id');
    const clientId = c.req.query('clientId') || c.req.query('client_id');
    const status = c.req.query('status');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')) : 50;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')) : 0;
    
    const result = await crudDb.getEmailTemplates({
      templateType,
      eventType,
      siteId,
      clientId,
      status,
      limit,
      offset
    });
    
    return c.json(result);
  } catch (error: any) {
    console.error('[Get Email Templates V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

/**
 * Get email template by ID
 */
export async function getEmailTemplateByIdV2(c: any) {
  try {
    const id = c.req.param('id');
    const template = await crudDb.getEmailTemplateById(id);
    
    return c.json({ success: true, data: template });
  } catch (error: any) {
    console.error('[Get Email Template By ID V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

/**
 * Create email template
 */
export async function createEmailTemplateV2(c: any) {
  try {
    const input = await c.req.json();
    const template = await crudDb.createEmailTemplate(input);
    
    return c.json({ success: true, data: template }, 201);
  } catch (error: any) {
    console.error('[Create Email Template V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

/**
 * Update email template
 */
export async function updateEmailTemplateV2(c: any) {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const template = await crudDb.updateEmailTemplate(id, updates);
    
    return c.json({ success: true, data: template });
  } catch (error: any) {
    console.error('[Update Email Template V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

/**
 * Delete email template
 */
export async function deleteEmailTemplateV2(c: any) {
  try {
    const id = c.req.param('id');
    await crudDb.deleteEmailTemplate(id);
    
    return c.json({ success: true, message: 'Email template deleted successfully' });
  } catch (error: any) {
    console.error('[Delete Email Template V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}


/**
 * Extract colors from a website URL
 */
export async function extractColorsFromWebsiteV2(c: any) {
  console.log('[extractColorsFromWebsiteV2] Function called');
  try {
    const { url } = await c.req.json();
    console.log('[extractColorsFromWebsiteV2] URL:', url);
    
    if (!url) {
      return c.json({ success: false, error: 'URL is required' }, 400);
    }

    // Normalize URL - add https:// if no protocol specified
    let normalizedUrl = url.trim();
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(normalizedUrl);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        return c.json({ success: false, error: 'URL must use HTTP or HTTPS protocol' }, 400);
      }
    } catch (e) {
      return c.json({ success: false, error: 'Invalid URL format. Please enter a valid domain (e.g., example.com or https://example.com)' }, 400);
    }

    console.log('[Extract Colors] Fetching website:', normalizedUrl);

    // Fetch the website HTML with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BrandExtractor/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return c.json({ 
          success: false, 
          error: `Failed to fetch website: ${response.status} ${response.statusText}` 
        }, 500);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/html')) {
        return c.json({ 
          success: false, 
          error: 'URL does not return HTML content. Please provide a valid website URL.' 
        }, 400);
      }

      const html = await response.text();
      
      // Extract colors from HTML, inline styles, and style tags with context
      const colorRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b|rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)|rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/gi;
      
      // Track color context (CSS properties where colors appear)
      interface ColorContext {
        color: string;
        count: number;
        contexts: string[];
        priority: number; // Higher = more important
      }
      
      const colorMap = new Map<string, ColorContext>();
      
      // Extract colors with context from CSS-like text
      const extractColorsWithContext = (text: string, source: string) => {
        // Look for CSS property: color patterns with class context
        const cssRuleRegex = /([.#][\w-]+(?:\s+[.#][\w-]+)*)\s*\{([^}]+)\}/gi;
        let ruleMatch;
        
        while ((ruleMatch = cssRuleRegex.exec(text)) !== null) {
          const selector = ruleMatch[1].toLowerCase();
          const rules = ruleMatch[2];
          
          // Determine priority based on selector
          let priority = 0;
          if (selector.includes('button') || selector.includes('btn')) {
            priority = 100; // Highest priority for buttons
          } else if (selector.includes('footer')) {
            priority = 90; // High priority for footer
          } else if (selector.includes('header') || selector.includes('nav')) {
            priority = 80; // High priority for header/nav
          } else if (selector.includes('primary') || selector.includes('brand')) {
            priority = 70; // High priority for primary/brand classes
          } else if (selector.includes('background') || selector.includes('bg-')) {
            priority = 50; // Medium priority for backgrounds
          }
          
          // Extract colors from the rules
          const colorPropertyRegex = /(background-color|background|color|border-color|fill|stroke):\s*(#[0-9A-Fa-f]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))/gi;
          let colorMatch;
          
          while ((colorMatch = colorPropertyRegex.exec(rules)) !== null) {
            const property = colorMatch[1];
            const colorValue = colorMatch[2];
            
            let hexColor: string;
            
            if (colorValue.startsWith('#')) {
              hexColor = colorValue.length === 4 
                ? `#${colorValue[1]}${colorValue[1]}${colorValue[2]}${colorValue[2]}${colorValue[3]}${colorValue[3]}` 
                : colorValue;
            } else if (colorValue.startsWith('rgb')) {
              const rgbMatch = colorValue.match(/(\d+)/g);
              if (rgbMatch && rgbMatch.length >= 3) {
                const r = parseInt(rgbMatch[0]);
                const g = parseInt(rgbMatch[1]);
                const b = parseInt(rgbMatch[2]);
                hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
              } else {
                continue;
              }
            } else {
              continue;
            }
            
            // Filter out very light and very dark colors
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            
            if (brightness > 30 && brightness < 240) {
              const upperHex = hexColor.toUpperCase();
              const existing = colorMap.get(upperHex);
              
              const contextLabel = selector.includes('button') || selector.includes('btn') 
                ? 'button' 
                : selector.includes('footer') 
                ? 'footer'
                : selector.includes('header') || selector.includes('nav')
                ? 'header'
                : property;
              
              if (existing) {
                existing.count++;
                existing.priority = Math.max(existing.priority, priority);
                if (!existing.contexts.includes(contextLabel)) {
                  existing.contexts.push(contextLabel);
                }
              } else {
                colorMap.set(upperHex, {
                  color: upperHex,
                  count: 1,
                  priority: priority,
                  contexts: [contextLabel],
                });
              }
            }
          }
        }
      };
      
      // Extract from HTML
      extractColorsWithContext(html, 'html');
      
      // Also try to extract CSS file URLs and fetch them
      const cssLinkRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*>/gi;
      const cssLinks = [];
      let cssMatch;
      while ((cssMatch = cssLinkRegex.exec(html)) !== null) {
        cssLinks.push(cssMatch[1]);
      }
      
      // Fetch up to 3 CSS files
      const cssPromises = cssLinks.slice(0, 3).map(async (cssUrl) => {
        try {
          // Resolve relative URLs
          const absoluteCssUrl = new URL(cssUrl, normalizedUrl).href;
          console.log('[Extract Colors] Fetching CSS:', absoluteCssUrl);
          
          const cssController = new AbortController();
          const cssTimeoutId = setTimeout(() => cssController.abort(), 5000);
          
          const cssResponse = await fetch(absoluteCssUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; BrandExtractor/1.0)',
            },
            signal: cssController.signal,
          });
          
          clearTimeout(cssTimeoutId);
          
          if (cssResponse.ok) {
            const cssText = await cssResponse.text();
            extractColorsWithContext(cssText, 'css');
          }
        } catch (err) {
          console.log('[Extract Colors] Failed to fetch CSS:', cssUrl, err.message);
        }
      });
      
      await Promise.all(cssPromises);
      
      if (colorMap.size === 0) {
        return c.json({ 
          success: false, 
          error: 'No colors found in the website HTML or CSS files.' 
        }, 404);
      }
      
      // Sort by priority first, then frequency, and take top 12
      const sortedColors = Array.from(colorMap.values())
        .sort((a, b) => {
          // First sort by priority (higher is better)
          if (b.priority !== a.priority) {
            return b.priority - a.priority;
          }
          // Then by frequency
          return b.count - a.count;
        })
        .slice(0, 12)
        .map(item => ({
          color: item.color,
          count: item.count,
          usage: item.contexts.join(', '),
          priority: item.priority,
        }));
      
      console.log('[Extract Colors] Found', sortedColors.length, 'colors with context');
      
      return c.json({
        success: true,
        colors: sortedColors,
        url: normalizedUrl,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return c.json({ 
          success: false, 
          error: 'Request timeout. The website took too long to respond.' 
        }, 504);
      }
      
      throw fetchError;
    }
  } catch (error: any) {
    console.error('[Extract Colors] Error:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to extract colors from website' 
    }, 500);
  }
}
