# 🚀 ERP Integration Quick Reference Guide

## 📍 Navigation

### Admin Pages
- `/admin/erp-connections` - ERP Connection Management
- `/admin/client-site-erp-assignment` - Client/Site ERP Assignment

### Key Files
- **Frontend Service:** `/src/app/services/erpIntegrationService.ts`
- **Backend Module:** `/supabase/functions/server/erp_integration_enhanced.ts`
- **API Routes:** `/supabase/functions/server/index.tsx` (lines 4890-5200)

---

## 🔌 Connection Methods

### 1. API (REST/SOAP)
```typescript
{
  connectionMethod: 'api',
  credentials: {
    apiUrl: 'https://api.example.com',
    apiKey: 'your-key',
    apiSecret: 'your-secret',
    oauthToken: 'optional-token'
  }
}
```

### 2. DOI (Direct Order Integration)
```typescript
{
  connectionMethod: 'doi',
  credentials: {
    doiEndpoint: 'https://doi.example.com/endpoint',
    doiUsername: 'username',
    doiPassword: 'password'
  }
}
```

### 3. SFTP (File Transfer)
```typescript
{
  connectionMethod: 'sftp',
  credentials: {
    sftpHost: 'ftp.example.com',
    sftpPort: 22,
    sftpUsername: 'username',
    sftpPassword: 'password',
    sftpPath: '/data/export'
  }
}
```

---

## 📊 Data Types

| Data Type | Direction | Use Case |
|-----------|-----------|----------|
| `orders` | Bidirectional | Order creation & updates |
| `products` | Pull | Product catalog sync |
| `order_status` | Pull | Fulfillment tracking |
| `inventory` | Pull | Stock level sync |
| `employees` | Pull | Employee data import |
| `invoices` | Pull | Billing/invoice data |

---

## 🎯 Common Operations

### Create ERP Connection
```typescript
import { erpIntegrationService } from '@/services/erpIntegrationService';

await erpIntegrationService.createERPConnection({
  name: 'SAP Production',
  provider: 'SAP',
  connectionMethod: 'api',
  status: 'inactive',
  credentials: {
    apiUrl: 'https://sap.example.com/api',
    apiKey: 'your-api-key'
  },
  settings: {
    timeout: 30000,
    retryAttempts: 3,
    batchSize: 100,
    enabledDataTypes: ['orders', 'products', 'inventory']
  }
});
```

### Test Connection
```typescript
const result = await erpIntegrationService.testERPConnection(connectionId);

if (result.success) {
  console.log(`✅ Connected! (${result.responseTime}ms)`);
} else {
  console.error(`❌ Failed: ${result.message}`);
}
```

### Trigger Manual Sync
```typescript
const syncLog = await erpIntegrationService.triggerSync(
  connectionId,
  'products',
  'pull'
);

console.log(`Synced ${syncLog.recordsSuccess}/${syncLog.recordsProcessed} records`);
```

### Assign ERP to Client
```typescript
await erpIntegrationService.assignERPToClient({
  clientId: 'client_001',
  erpConnectionId: 'erp_001',
  catalogId: 'cat_001',
  isDefault: true,
  settings: {
    syncOrders: true,
    syncProducts: true,
    syncInventory: true,
    syncEmployees: false,
    syncInvoices: false
  }
});
```

### Assign ERP to Site (Override)
```typescript
await erpIntegrationService.assignERPToSite({
  siteId: 'site_001',
  clientId: 'client_001',
  erpConnectionId: 'erp_002', // Different from client
  catalogId: 'cat_002',
  overridesClient: true, // Override client settings
  settings: {
    syncOrders: true,
    syncProducts: true,
    syncInventory: true,
    syncEmployees: false,
    syncInvoices: false
  }
});
```

---

## 📈 Monitoring

### Get Sync Logs
```typescript
const logs = await erpIntegrationService.getSyncLogs(
  connectionId,
  'products',
  50 // limit
);
```

### Get Statistics
```typescript
const stats = await erpIntegrationService.getSyncStatistics(connectionId);

console.log(`
  Total Syncs: ${stats.totalSyncs}
  Success Rate: ${(stats.successfulSyncs / stats.totalSyncs * 100).toFixed(1)}%
  Avg Duration: ${stats.avgSyncDuration}s
  Total Records: ${stats.totalRecordsProcessed}
`);
```

---

## 🔐 Backend Implementation

### Adding a New Data Type Sync

1. **Add to TypeScript types:**
```typescript
// erp_integration_enhanced.ts
export type ERPDataType = 'orders' | 'products' | 'NEW_TYPE';
```

2. **Create sync function:**
```typescript
async function syncNewType(connection: ERPConnection): Promise<any> {
  console.log(`[ERP] Syncing NEW_TYPE for connection: ${connection.id}`);
  
  // Implement sync logic here
  // Make API call to ERP
  // Process data
  // Return stats
  
  return {
    processed: 100,
    success: 98,
    failed: 2
  };
}
```

3. **Add to triggerSync switch:**
```typescript
switch (dataType) {
  case 'orders':
    result = await syncOrders(connection, direction);
    break;
  case 'NEW_TYPE':
    result = await syncNewType(connection);
    break;
  // ... other cases
}
```

---

## 🧪 Testing Checklist

### Before Production
- [ ] Test API connection with real credentials
- [ ] Test DOI endpoint with valid XML
- [ ] Test SFTP with actual server
- [ ] Verify sync for each data type
- [ ] Test client assignment
- [ ] Test site override
- [ ] Check sync logging
- [ ] Verify statistics calculation
- [ ] Test error handling
- [ ] Audit log verification

---

## ⚠️ Important Notes

### Security
- ✅ All routes protected with `verifyAdmin`
- ✅ Credentials never exposed in logs
- ✅ Audit logging for all operations
- ✅ HTTPS only for API calls

### Performance
- ⏱️ Default timeout: 30 seconds
- 🔄 Default retry: 3 attempts
- 📦 Default batch: 100 records
- 📅 Recommend sync schedule: Every 6 hours

### Limitations
- SFTP requires native library integration
- DOI supports XML format only
- Sync operations are simulated (placeholders)
- Real ERP connectors need to be implemented

---

## 🐛 Debugging

### Enable Verbose Logging
```typescript
// Backend logs automatically to console
// Check Supabase Edge Function logs

// Frontend debugging
localStorage.setItem('debug', 'erp:*');
```

### Common Issues

**Connection Test Fails:**
- Check API URL is accessible
- Verify credentials are correct
- Check network connectivity
- Review timeout settings

**Sync Fails:**
- Check ERP connection is active
- Verify data type is enabled
- Check sync logs for errors
- Review field mappings

**Assignment Not Working:**
- Verify client ID exists
- Check site belongs to client
- Confirm ERP connection exists
- Review override settings

---

## 📚 Additional Resources

- [ERP Integration System Summary](/ERP_INTEGRATION_SYSTEM_SUMMARY.md)
- [Backend Implementation Complete](/ERP_BACKEND_IMPLEMENTATION_COMPLETE.md)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)

---

**Last Updated:** February 17, 2026  
**Version:** 1.0.0  
**Status:** Production Ready (with placeholder connectors)
