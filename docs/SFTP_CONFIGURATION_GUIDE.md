# SFTP Configuration Guide

## Overview

SFTP (Secure File Transfer Protocol) configuration is used to automate employee data imports from external SFTP servers. This feature allows clients to automatically sync employee information without manual CSV uploads.

## Configuration Location

**IMPORTANT**: SFTP configuration is managed at the **CLIENT LEVEL**, not at the site level.

### Where to Configure SFTP

1. Navigate to **Admin Dashboard**
2. Select **Clients** from the main menu
3. Choose the client you want to configure
4. Click on **Client Configuration** or the settings icon
5. Go to the **SFTP** tab

Alternatively, you can access SFTP configuration through:
- **Employee Management** → **SFTP Integration** tab (client-level view)

### Why Client-Level?

SFTP configuration is stored at the client level because:

1. **Centralized Management**: One SFTP server typically serves all sites under a client
2. **Simplified Administration**: Configure once, applies to all client sites
3. **Consistent Data Source**: Employee data comes from a single source system
4. **Reduced Redundancy**: No need to configure the same SFTP settings for each site

## Configuration Options

### Connection Settings

- **SFTP Host**: Server address (e.g., sftp.example.com)
- **Port**: Connection port (default: 22)
- **Username**: SFTP account username
- **Authentication Method**: 
  - Password authentication
  - SSH private key authentication

### File Settings

- **Remote Path**: Directory path on SFTP server where employee files are located
- **File Pattern**: Pattern to match files (e.g., `employees-*.csv`, `*.xlsx`)
- **Archive Path**: Where processed files are moved after import
- **Delete After Import**: Option to remove files after successful processing

### Schedule Configuration

- **Frequency Options**:
  - Hourly
  - Daily (specify time)
  - Weekly (specify day and time)
  - Manual only

### Processing Options

- **Auto-process Files**: Automatically import when new files are detected
- **Notify on Success**: Send notifications for successful imports
- **Notify on Failure**: Send alerts when imports fail

## Testing Connection

Before enabling automated imports:

1. Fill in all required connection settings
2. Click **Test Connection** button
3. Verify the connection is successful
4. Review any error messages if the test fails

## Manual Sync

Even with scheduled imports configured, you can trigger a manual sync:

1. Go to SFTP configuration
2. Click **Run Manual Sync** button
3. Monitor the sync progress
4. Review import results

## Site Mapping

After SFTP imports employee data at the client level, use **Site Mapping Rules** to automatically assign employees to the correct sites based on:

- Country
- Department
- Region
- Employee ID patterns
- Custom attributes

## Troubleshooting

### Connection Issues

- Verify SFTP host and port are correct
- Check firewall rules allow outbound connections
- Ensure credentials are valid and not expired
- For key authentication, verify the private key format

### Import Failures

- Check file format matches expected CSV/Excel structure
- Verify file pattern matches actual file names
- Review file permissions on SFTP server
- Check archive path exists and is writable

### Missing Employees

- Verify site mapping rules are configured correctly
- Check employee data includes required fields
- Review import logs for validation errors

## Best Practices

1. **Test First**: Always test the connection before enabling automated imports
2. **Start Manual**: Run manual syncs first to verify data quality
3. **Monitor Initially**: Watch the first few automated imports closely
4. **Archive Files**: Enable archiving to maintain import history
5. **Set Notifications**: Configure failure notifications for quick issue detection
6. **Regular Reviews**: Periodically review mapping rules and import logs

## Related Documentation

- [Employee Management Architecture](./EMPLOYEE_MANAGEMENT_ARCHITECTURE.md)
- [Site Mapping Rules](./SITE_MAPPING_RULES.md)
- [Client Configuration Guide](./CLIENT_CONFIGURATION_GUIDE.md)

## API Endpoints

For developers integrating with SFTP configuration:

```
GET    /clients/:clientId/sftp-config          # Get SFTP configuration
PUT    /clients/:clientId/sftp-config          # Update SFTP configuration
POST   /clients/:clientId/sftp-test            # Test SFTP connection
POST   /clients/:clientId/sftp-sync            # Trigger manual sync
```

## Migration Notes

**Previous Location**: SFTP configuration was previously shown in site-level settings (Access tab in Site Configuration).

**Current Location**: SFTP configuration is now exclusively in client-level settings.

**Migration Impact**: Existing SFTP configurations have been automatically migrated to the client level. No action required for existing configurations.
