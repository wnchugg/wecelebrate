/**
 * KV Store to Relational Tables Migration Script
 * Phase 1: Database Optimization
 * 
 * This script migrates data from the generic KV store to proper relational tables.
 * It includes validation, error handling, and progress tracking.
 * 
 * Usage:
 *   deno run --allow-net --allow-env migrate_kv_to_tables.ts [--dry-run] [--batch-size=100]
 * 
 * Options:
 *   --dry-run: Preview migration without making changes
 *   --batch-size: Number of records to process per batch (default: 100)
 *   --skip-validation: Skip data validation (not recommended)
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from '../kv_env.ts';

// ============================================================================
// Configuration
// ============================================================================

interface MigrationConfig {
  dryRun: boolean;
  batchSize: number;
  skipValidation: boolean;
  verbose: boolean;
}

interface MigrationStats {
  startTime: Date;
  endTime?: Date;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  skippedRecords: number;
  errors: Array<{ key: string; error: string }>;
}

interface MigrationResult {
  success: boolean;
  stats: MigrationStats;
  message: string;
}

// Parse command line arguments
const args = Deno.args;
const config: MigrationConfig = {
  dryRun: args.includes('--dry-run'),
  batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '100'),
  skipValidation: args.includes('--skip-validation'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================================================
// Logging Utilities
// ============================================================================

function log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    warn: '⚠️',
    error: '❌',
    success: '✅',
  }[level];
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function logVerbose(message: string) {
  if (config.verbose) {
    log(message, 'info');
  }
}

// ============================================================================
// Data Validation
// ============================================================================

function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 100;
}

function sanitizeData(data: any): any {
  // Remove null bytes and other problematic characters
  if (typeof data === 'string') {
    return data.replace(/\0/g, '').trim();
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> | unknown[] = Array.isArray(data) ? [] : {};
    for (const key in data) {
      sanitized[key] = sanitizeData(data[key]);
    }
    return sanitized;
  }
  return data;
}

// ============================================================================
// Migration Functions
// ============================================================================

/**
 * Migrate Clients from KV store to clients table
 */
async function migrateClients(stats: MigrationStats): Promise<void> {
  log('Starting clients migration...');
  
  try {
    // Get all client IDs from KV store
    const clientIds: string[] = await kv.get('clients:all') || [];
    log(`Found ${clientIds.length} clients to migrate`);
    
    const clients = [];
    
    // Load each client
    for (const clientId of clientIds) {
      try {
        const client = await kv.get(`client:${clientId}`);
        if (!client) {
          log(`Client ${clientId} not found, skipping`, 'warn');
          stats.skippedRecords++;
          continue;
        }
        
        // Validate and sanitize
        if (!config.skipValidation) {
          if (!client.name || client.name.length < 2) {
            throw new Error('Invalid client name');
          }
          if (!client.contact_email || !validateEmail(client.contact_email)) {
            throw new Error('Invalid contact email');
          }
        }
        
        const sanitized = sanitizeData(client);
        clients.push({
          id: clientId,
          name: sanitized.name,
          contact_email: sanitized.contact_email,
          status: sanitized.status || 'active',
          client_code: sanitized.client_code,
          client_region: sanitized.client_region,
          client_source_code: sanitized.client_source_code,
          client_contact_name: sanitized.client_contact_name,
          client_contact_phone: sanitized.client_contact_phone,
          client_tax_id: sanitized.client_tax_id,
          client_address_line_1: sanitized.client_address_line_1,
          client_address_line_2: sanitized.client_address_line_2,
          client_address_line_3: sanitized.client_address_line_3,
          client_city: sanitized.client_city,
          client_postal_code: sanitized.client_postal_code,
          client_country_state: sanitized.client_country_state,
          client_country: sanitized.client_country,
          client_account_manager: sanitized.client_account_manager,
          client_account_manager_email: sanitized.client_account_manager_email,
          client_implementation_manager: sanitized.client_implementation_manager,
          client_implementation_manager_email: sanitized.client_implementation_manager_email,
          technology_owner: sanitized.technology_owner,
          technology_owner_email: sanitized.technology_owner_email,
          client_url: sanitized.client_url,
          client_allow_session_timeout_extend: sanitized.client_allow_session_timeout_extend,
          client_authentication_method: sanitized.client_authentication_method,
          client_custom_url: sanitized.client_custom_url,
          client_has_employee_data: sanitized.client_has_employee_data,
          client_invoice_type: sanitized.client_invoice_type,
          client_invoice_template_type: sanitized.client_invoice_template_type,
          client_po_type: sanitized.client_po_type,
          client_po_number: sanitized.client_po_number,
          client_erp_system: sanitized.client_erp_system,
          client_sso: sanitized.client_sso,
          client_hris_system: sanitized.client_hris_system,
          created_at: sanitized.created_at || new Date().toISOString(),
          updated_at: sanitized.updated_at || new Date().toISOString(),
        });
        
        stats.successfulRecords++;
        logVerbose(`✓ Prepared client: ${sanitized.name}`);
        
      } catch (error) {
        log(`Failed to prepare client ${clientId}: ${error.message}`, 'error');
        stats.failedRecords++;
        stats.errors.push({ key: `client:${clientId}`, error: error.message });
      }
    }
    
    // Insert into database
    if (!config.dryRun && clients.length > 0) {
      const { error } = await supabase
        .from('clients')
        .upsert(clients, { onConflict: 'id' });
      
      if (error) {
        throw new Error(`Failed to insert clients: ${error.message}`);
      }
      
      log(`✅ Migrated ${clients.length} clients`, 'success');
    } else if (config.dryRun) {
      log(`[DRY RUN] Would migrate ${clients.length} clients`);
    }
    
  } catch (error) {
    log(`Clients migration failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Migrate Catalogs from KV store to catalogs table
 */
async function migrateCatalogs(stats: MigrationStats): Promise<void> {
  log('Starting catalogs migration...');
  
  try {
    const catalogIds: string[] = await kv.get('catalogs:all') || [];
    log(`Found ${catalogIds.length} catalogs to migrate`);
    
    const catalogs = [];
    
    for (const catalogId of catalogIds) {
      try {
        const catalog = await kv.get(`catalogs:${catalogId}`);
        if (!catalog) {
          log(`Catalog ${catalogId} not found, skipping`, 'warn');
          stats.skippedRecords++;
          continue;
        }
        
        // Validate
        if (!config.skipValidation) {
          if (!catalog.name || catalog.name.length < 2) {
            throw new Error('Invalid catalog name');
          }
          if (!catalog.type || !['erp', 'manual', 'vendor', 'dropship'].includes(catalog.type)) {
            throw new Error('Invalid catalog type');
          }
        }
        
        const sanitized = sanitizeData(catalog);
        catalogs.push({
          id: catalogId,
          name: sanitized.name,
          description: sanitized.description,
          type: sanitized.type,
          status: sanitized.status || 'draft',
          source: sanitized.source || {},
          settings: sanitized.settings || {},
          managed_by: sanitized.managedBy,
          owner_id: sanitized.ownerId,
          total_products: sanitized.totalProducts || 0,
          active_products: sanitized.activeProducts || 0,
          last_synced_at: sanitized.lastSyncedAt,
          next_sync_at: sanitized.nextSyncAt,
          created_at: sanitized.createdAt || new Date().toISOString(),
          updated_at: sanitized.updatedAt || new Date().toISOString(),
        });
        
        stats.successfulRecords++;
        logVerbose(`✓ Prepared catalog: ${sanitized.name}`);
        
      } catch (error) {
        log(`Failed to prepare catalog ${catalogId}: ${error.message}`, 'error');
        stats.failedRecords++;
        stats.errors.push({ key: `catalogs:${catalogId}`, error: error.message });
      }
    }
    
    if (!config.dryRun && catalogs.length > 0) {
      const { error } = await supabase
        .from('catalogs')
        .upsert(catalogs, { onConflict: 'id' });
      
      if (error) {
        throw new Error(`Failed to insert catalogs: ${error.message}`);
      }
      
      log(`✅ Migrated ${catalogs.length} catalogs`, 'success');
    } else if (config.dryRun) {
      log(`[DRY RUN] Would migrate ${catalogs.length} catalogs`);
    }
    
  } catch (error) {
    log(`Catalogs migration failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Migrate Sites from KV store to sites table
 */
async function migrateSites(stats: MigrationStats): Promise<void> {
  log('Starting sites migration...');
  
  try {
    const siteIds: string[] = await kv.get('sites:all') || [];
    log(`Found ${siteIds.length} sites to migrate`);
    
    const sites = [];
    
    for (const siteId of siteIds) {
      try {
        const site = await kv.get(`site:${siteId}`);
        if (!site) {
          log(`Site ${siteId} not found, skipping`, 'warn');
          stats.skippedRecords++;
          continue;
        }
        
        // Validate
        if (!config.skipValidation) {
          if (!site.name || site.name.length < 2) {
            throw new Error('Invalid site name');
          }
          if (!site.client_id || !validateUUID(site.client_id)) {
            throw new Error('Invalid client_id');
          }
          if (!site.slug || !validateSlug(site.slug)) {
            throw new Error('Invalid slug');
          }
        }
        
        const sanitized = sanitizeData(site);
        sites.push({
          id: siteId,
          client_id: sanitized.client_id,
          catalog_id: sanitized.catalog_id,
          name: sanitized.name,
          slug: sanitized.slug,
          status: sanitized.status || 'draft',
          validation_methods: sanitized.validation_methods || [],
          branding: sanitized.branding || {},
          selection_start_date: sanitized.selection_start_date,
          selection_end_date: sanitized.selection_end_date,
          site_code: sanitized.site_code,
          site_erp_integration: sanitized.site_erp_integration,
          site_erp_instance: sanitized.site_erp_instance,
          site_ship_from_country: sanitized.site_ship_from_country,
          site_hris_system: sanitized.site_hris_system,
          site_drop_down_name: sanitized.site_drop_down_name,
          site_custom_domain_url: sanitized.site_custom_domain_url,
          site_account_manager: sanitized.site_account_manager,
          site_account_manager_email: sanitized.site_account_manager_email,
          site_celebrations_enabled: sanitized.site_celebrations_enabled,
          allow_session_timeout_extend: sanitized.allow_session_timeout_extend,
          enable_employee_log_report: sanitized.enable_employee_log_report,
          regional_client_info: sanitized.regional_client_info || {},
          disable_direct_access_auth: sanitized.disable_direct_access_auth,
          sso_provider: sanitized.sso_provider,
          sso_client_office_name: sanitized.sso_client_office_name,
          created_at: sanitized.created_at || new Date().toISOString(),
          updated_at: sanitized.updated_at || new Date().toISOString(),
        });
        
        stats.successfulRecords++;
        logVerbose(`✓ Prepared site: ${sanitized.name}`);
        
      } catch (error) {
        log(`Failed to prepare site ${siteId}: ${error.message}`, 'error');
        stats.failedRecords++;
        stats.errors.push({ key: `site:${siteId}`, error: error.message });
      }
    }
    
    if (!config.dryRun && sites.length > 0) {
      const { error } = await supabase
        .from('sites')
        .upsert(sites, { onConflict: 'id' });
      
      if (error) {
        throw new Error(`Failed to insert sites: ${error.message}`);
      }
      
      log(`✅ Migrated ${sites.length} sites`, 'success');
    } else if (config.dryRun) {
      log(`[DRY RUN] Would migrate ${sites.length} sites`);
    }
    
  } catch (error) {
    log(`Sites migration failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Migrate Products (Gifts) from KV store to products table
 * This is the most critical migration as it handles potentially thousands of records
 */
async function migrateProducts(stats: MigrationStats): Promise<void> {
  log('Starting products migration...');
  
  try {
    const giftIds: string[] = await kv.get('gifts:all') || [];
    log(`Found ${giftIds.length} products to migrate`);
    
    // Process in batches to avoid memory issues
    const batchSize = config.batchSize;
    const totalBatches = Math.ceil(giftIds.length / batchSize);
    
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const start = batchNum * batchSize;
      const end = Math.min(start + batchSize, giftIds.length);
      const batchIds = giftIds.slice(start, end);
      
      log(`Processing batch ${batchNum + 1}/${totalBatches} (${batchIds.length} products)`);
      
      const products = [];
      
      for (const giftId of batchIds) {
        try {
          const gift = await kv.get(`gift:${giftId}`);
          if (!gift) {
            log(`Product ${giftId} not found, skipping`, 'warn');
            stats.skippedRecords++;
            continue;
          }
          
          // Validate
          if (!config.skipValidation) {
            if (!gift.name || gift.name.length < 2) {
              throw new Error('Invalid product name');
            }
            if (!gift.sku) {
              throw new Error('Missing SKU');
            }
            if (!gift.catalogId || !validateUUID(gift.catalogId)) {
              throw new Error('Invalid catalog_id');
            }
            if (gift.price === undefined || gift.price < 0) {
              throw new Error('Invalid price');
            }
          }
          
          const sanitized = sanitizeData(gift);
          
          // Handle source information
          const source = sanitized.source || {};
          
          products.push({
            id: giftId,
            catalog_id: sanitized.catalogId,
            sku: sanitized.sku,
            external_id: source.externalId,
            external_sku: source.externalSku,
            name: sanitized.name,
            description: sanitized.description,
            category: sanitized.category,
            brand: sanitized.brand,
            price: sanitized.price,
            cost: sanitized.cost,
            msrp: sanitized.msrp,
            currency: sanitized.currency || 'USD',
            images: sanitized.images || [],
            image_url: sanitized.imageUrl || sanitized.image,
            features: sanitized.features || [],
            specifications: sanitized.specifications || {},
            available_quantity: sanitized.availableQuantity || 0,
            track_inventory: sanitized.trackInventory !== false,
            status: sanitized.status || 'active',
            sync_status: source.syncStatus || 'manual',
            sync_notes: source.syncNotes,
            last_synced_at: source.lastSyncedAt,
            created_at: sanitized.createdAt || new Date().toISOString(),
            updated_at: sanitized.updatedAt || new Date().toISOString(),
          });
          
          stats.successfulRecords++;
          logVerbose(`✓ Prepared product: ${sanitized.name}`);
          
        } catch (error) {
          log(`Failed to prepare product ${giftId}: ${error.message}`, 'error');
          stats.failedRecords++;
          stats.errors.push({ key: `gift:${giftId}`, error: error.message });
        }
      }
      
      // Insert batch
      if (!config.dryRun && products.length > 0) {
        const { error } = await supabase
          .from('products')
          .upsert(products, { onConflict: 'id' });
        
        if (error) {
          throw new Error(`Failed to insert products batch ${batchNum + 1}: ${error.message}`);
        }
        
        log(`✅ Migrated batch ${batchNum + 1}/${totalBatches} (${products.length} products)`, 'success');
      } else if (config.dryRun) {
        log(`[DRY RUN] Would migrate batch ${batchNum + 1}/${totalBatches} (${products.length} products)`);
      }
    }
    
    log(`✅ Completed products migration (${giftIds.length} total)`, 'success');
    
  } catch (error) {
    log(`Products migration failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Migrate Employees from KV store to employees table
 */
async function migrateEmployees(stats: MigrationStats): Promise<void> {
  log('Starting employees migration...');
  
  try {
    const employeeIds: string[] = await kv.get('employees:all') || [];
    log(`Found ${employeeIds.length} employees to migrate`);
    
    const employees = [];
    
    for (const employeeId of employeeIds) {
      try {
        const employee = await kv.get(`employee:${employeeId}`);
        if (!employee) {
          log(`Employee ${employeeId} not found, skipping`, 'warn');
          stats.skippedRecords++;
          continue;
        }
        
        // Validate
        if (!config.skipValidation) {
          if (!employee.site_id || !validateUUID(employee.site_id)) {
            throw new Error('Invalid site_id');
          }
          if (!employee.employee_id) {
            throw new Error('Missing employee_id');
          }
          if (employee.email && !validateEmail(employee.email)) {
            throw new Error('Invalid email');
          }
        }
        
        const sanitized = sanitizeData(employee);
        employees.push({
          id: employeeId,
          site_id: sanitized.site_id,
          employee_id: sanitized.employee_id,
          email: sanitized.email,
          serial_card_number: sanitized.serial_card_number,
          first_name: sanitized.first_name,
          last_name: sanitized.last_name,
          status: sanitized.status || 'active',
          created_at: sanitized.created_at || new Date().toISOString(),
          updated_at: sanitized.updated_at || new Date().toISOString(),
        });
        
        stats.successfulRecords++;
        logVerbose(`✓ Prepared employee: ${sanitized.employee_id}`);
        
      } catch (error) {
        log(`Failed to prepare employee ${employeeId}: ${error.message}`, 'error');
        stats.failedRecords++;
        stats.errors.push({ key: `employee:${employeeId}`, error: error.message });
      }
    }
    
    if (!config.dryRun && employees.length > 0) {
      const { error } = await supabase
        .from('employees')
        .upsert(employees, { onConflict: 'id' });
      
      if (error) {
        throw new Error(`Failed to insert employees: ${error.message}`);
      }
      
      log(`✅ Migrated ${employees.length} employees`, 'success');
    } else if (config.dryRun) {
      log(`[DRY RUN] Would migrate ${employees.length} employees`);
    }
    
  } catch (error) {
    log(`Employees migration failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Migrate Orders from KV store to orders table
 */
async function migrateOrders(stats: MigrationStats): Promise<void> {
  log('Starting orders migration...');
  
  try {
    const orderIds: string[] = await kv.get('orders:all') || [];
    log(`Found ${orderIds.length} orders to migrate`);
    
    const orders = [];
    
    for (const orderId of orderIds) {
      try {
        const order = await kv.get(`order:${orderId}`);
        if (!order) {
          log(`Order ${orderId} not found, skipping`, 'warn');
          stats.skippedRecords++;
          continue;
        }
        
        // Validate
        if (!config.skipValidation) {
          if (!order.site_id || !validateUUID(order.site_id)) {
            throw new Error('Invalid site_id');
          }
          if (!order.customer_email || !validateEmail(order.customer_email)) {
            throw new Error('Invalid customer_email');
          }
        }
        
        const sanitized = sanitizeData(order);
        
        // Generate order number if missing
        const orderNumber = sanitized.order_number || `ORD-${Date.now()}-${orderId.slice(0, 8)}`;
        
        orders.push({
          id: orderId,
          client_id: sanitized.client_id,
          site_id: sanitized.site_id,
          product_id: sanitized.gift_id || sanitized.product_id,
          employee_id: sanitized.employee_id,
          order_number: orderNumber,
          customer_name: sanitized.customer_name || 'Unknown',
          customer_email: sanitized.customer_email,
          customer_employee_id: sanitized.customer_employee_id,
          status: sanitized.status || 'pending',
          total_amount: sanitized.total_amount || 0,
          currency: sanitized.currency || 'USD',
          shipping_address: sanitized.shipping_address || {},
          tracking_number: sanitized.tracking_number,
          items: sanitized.items || [],
          metadata: sanitized.metadata || {},
          notes: sanitized.notes,
          created_at: sanitized.created_at || new Date().toISOString(),
          updated_at: sanitized.updated_at || new Date().toISOString(),
          confirmed_at: sanitized.confirmed_at,
          shipped_at: sanitized.shipped_at,
          delivered_at: sanitized.delivered_at,
          cancelled_at: sanitized.cancelled_at,
        });
        
        stats.successfulRecords++;
        logVerbose(`✓ Prepared order: ${orderNumber}`);
        
      } catch (error) {
        log(`Failed to prepare order ${orderId}: ${error.message}`, 'error');
        stats.failedRecords++;
        stats.errors.push({ key: `order:${orderId}`, error: error.message });
      }
    }
    
    if (!config.dryRun && orders.length > 0) {
      const { error } = await supabase
        .from('orders')
        .upsert(orders, { onConflict: 'id' });
      
      if (error) {
        throw new Error(`Failed to insert orders: ${error.message}`);
      }
      
      log(`✅ Migrated ${orders.length} orders`, 'success');
    } else if (config.dryRun) {
      log(`[DRY RUN] Would migrate ${orders.length} orders`);
    }
    
  } catch (error) {
    log(`Orders migration failed: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================================================
// Main Migration Orchestrator
// ============================================================================

async function runMigration(): Promise<MigrationResult> {
  const stats: MigrationStats = {
    startTime: new Date(),
    totalRecords: 0,
    successfulRecords: 0,
    failedRecords: 0,
    skippedRecords: 0,
    errors: [],
  };
  
  try {
    log('='.repeat(80));
    log('KV Store to Relational Tables Migration');
    log('='.repeat(80));
    log(`Mode: ${config.dryRun ? 'DRY RUN' : 'LIVE'}`);
    log(`Batch Size: ${config.batchSize}`);
    log(`Validation: ${config.skipValidation ? 'DISABLED' : 'ENABLED'}`);
    log('='.repeat(80));
    
    // Run migrations in order (respecting foreign key dependencies)
    await migrateClients(stats);
    await migrateCatalogs(stats);
    await migrateSites(stats);
    await migrateProducts(stats);
    await migrateEmployees(stats);
    await migrateOrders(stats);
    
    stats.endTime = new Date();
    const duration = (stats.endTime.getTime() - stats.startTime.getTime()) / 1000;
    
    log('='.repeat(80));
    log('Migration Summary', 'success');
    log('='.repeat(80));
    log(`Duration: ${duration.toFixed(2)} seconds`);
    log(`Total Records: ${stats.totalRecords}`);
    log(`Successful: ${stats.successfulRecords}`);
    log(`Failed: ${stats.failedRecords}`);
    log(`Skipped: ${stats.skippedRecords}`);
    
    if (stats.errors.length > 0) {
      log(`\nErrors (${stats.errors.length}):`, 'error');
      stats.errors.slice(0, 10).forEach(err => {
        log(`  ${err.key}: ${err.error}`, 'error');
      });
      if (stats.errors.length > 10) {
        log(`  ... and ${stats.errors.length - 10} more errors`, 'error');
      }
    }
    
    log('='.repeat(80));
    
    if (config.dryRun) {
      log('✅ DRY RUN COMPLETE - No changes were made', 'success');
    } else {
      log('✅ MIGRATION COMPLETE', 'success');
    }
    
    return {
      success: stats.failedRecords === 0,
      stats,
      message: config.dryRun 
        ? 'Dry run completed successfully' 
        : 'Migration completed successfully',
    };
    
  } catch (error) {
    stats.endTime = new Date();
    log(`Migration failed: ${error.message}`, 'error');
    
    return {
      success: false,
      stats,
      message: `Migration failed: ${error.message}`,
    };
  }
}

// ============================================================================
// Entry Point
// ============================================================================

if (import.meta.main) {
  try {
    const result = await runMigration();
    
    // Exit with appropriate code
    Deno.exit(result.success ? 0 : 1);
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    Deno.exit(1);
  }
}

// Export for testing
export { runMigration, migrateClients, migrateCatalogs, migrateSites, migrateProducts, migrateEmployees, migrateOrders };
