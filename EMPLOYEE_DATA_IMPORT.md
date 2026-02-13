# Employee Data Import System

## Overview

The JALA 2 platform includes a comprehensive employee data import system that allows administrators to manage employee access through two methods:

1. **Manual CSV/Excel Upload** - Import employee data through a user-friendly interface with validation
2. **SFTP Automation** - Automatically import employee data via scheduled file transfers

## Features

### Manual Import
- Support for CSV, XLSX, and XLS file formats
- Real-time validation with detailed error reporting
- Duplicate detection within uploaded files
- Preview before import with validation status
- Template download for each validation method
- Bulk import up to 10,000 records per file

### SFTP Automation
- Scheduled imports (hourly, daily, weekly, or manual)
- Password or SSH key authentication
- Configurable file patterns and remote paths
- Auto-process files on detection
- Optional file deletion after successful import
- Connection testing before saving configuration

## Validation Methods

The import system supports all four validation methods:

### 1. Email Address Validation
**Required Columns:**
- `Email` - Valid email address (required)

**Optional Columns:**
- `First Name` - Employee first name
- `Last Name` - Employee last name
- `Department` - Department or team name

### 2. Employee ID Validation
**Required Columns:**
- `Employee ID` - Unique employee identifier (required)
- `Email` - Valid email address (required)

**Optional Columns:**
- `First Name` - Employee first name
- `Last Name` - Employee last name
- `Department` - Department or team name

### 3. Serial Card Validation
**Required Columns:**
- `Serial Card` - Unique card number (required)
- `Email` - Valid email address (optional but recommended)

**Optional Columns:**
- `First Name` - Employee first name
- `Last Name` - Employee last name
- `Department` - Department or team name

### 4. Magic Link Validation
**Required Columns:**
- `Email` - Valid email address (required)

**Optional Columns:**
- `First Name` - Employee first name
- `Last Name` - Employee last name
- `Department` - Department or team name

## Manual Import Process

### Step 1: Access Import Interface
1. Navigate to Admin Panel > Access Management
2. Select the appropriate validation method
3. Click "Import CSV" button

### Step 2: Prepare Your Data
1. Click "Download Template" to get a pre-formatted template
2. Fill in your employee data following the column requirements
3. Save as CSV or Excel format

### Step 3: Upload and Validate
1. Click "Choose File" or drag and drop your file
2. System automatically validates all records
3. Review validation results:
   - **Valid Records** (green) - Will be imported
   - **Errors** (red) - Invalid data, will not be imported
   - **Duplicates** (yellow) - Duplicate entries, will not be imported

### Step 4: Import
1. Review the preview table showing first 100 records
2. Click "Import X Records" to complete the import
3. Only valid records will be imported

## SFTP Automation Setup

### Step 1: Access SFTP Configuration
1. Navigate to Admin Panel > Access Management
2. Click "Configure SFTP" in the automation card

### Step 2: Server Configuration
Configure your SFTP server connection:

**Host Settings:**
- Host/Server Address (e.g., sftp.example.com)
- Port (default: 22)
- Username

**Authentication:**
Choose between:
- **Password Authentication** - Enter your SFTP password
- **SSH Key Authentication** - Paste your private key in PEM format

### Step 3: File Configuration
**Remote Path:**
- Directory on SFTP server where files are uploaded
- Example: `/uploads/employee-data`

**File Pattern:**
- Pattern to match files for import
- Examples:
  - `*.csv` - All CSV files
  - `employees_*.xlsx` - Excel files starting with "employees_"
  - `data_*.csv` - CSV files starting with "data_"

### Step 4: Schedule Configuration
**Import Frequency:**
- **Hourly** - Check for new files every hour
- **Daily** - Check once per day at specified time
- **Weekly** - Check once per week at specified time
- **Manual Only** - Only import when manually triggered

**Run Time:**
- Set specific time for daily/weekly imports
- Uses server timezone

### Step 5: Processing Options
**Auto-process Files:**
- Automatically import data when new files are detected
- If disabled, files will be queued for manual review

**Delete After Import:**
- Remove files from SFTP server after successful import
- Recommended to keep this disabled for backup purposes

### Step 6: Test and Save
1. Click "Test Connection" to verify SFTP credentials
2. Review connection status
3. Click "Save Configuration" to activate automation

## File Format Guidelines

### CSV Files
```csv
Email,First Name,Last Name,Department
john.doe@company.com,John,Doe,Sales
jane.smith@company.com,Jane,Smith,Marketing
```

### Excel Files
Create a spreadsheet with:
- First row containing column headers
- Each subsequent row containing employee data
- No empty rows between data

### Column Names
Column names are **case-insensitive** and support variations:
- Email: `Email`, `email`, `EMAIL`
- Employee ID: `Employee ID`, `employeeId`, `Employee Id`
- First Name: `First Name`, `firstName`, `First name`
- Last Name: `Last Name`, `lastName`, `Last name`

### Best Practices

1. **Data Quality**
   - Ensure all email addresses are valid and active
   - Remove duplicate entries before upload
   - Verify employee IDs match your internal system
   - Use consistent formatting

2. **File Size**
   - Keep files under 5MB
   - Maximum 10,000 records per file
   - Split larger datasets into multiple files

3. **Testing**
   - Test with a small sample file first
   - Verify all required columns are present
   - Check for special characters or encoding issues

4. **Security**
   - Use SFTP (not FTP) for encrypted file transfer
   - Use SSH keys instead of passwords when possible
   - Regularly rotate SFTP credentials
   - Delete files from SFTP server after import

5. **SFTP Automation**
   - Schedule imports during off-peak hours
   - Monitor import logs for errors
   - Keep backup copies of import files
   - Test SFTP connection regularly

## Validation Rules

### Email Validation
- Must be valid email format (user@domain.com)
- Cannot be empty (unless optional)
- Case-insensitive duplicate detection

### Employee ID Validation
- Cannot be empty
- Must be unique within file
- No specific format requirements

### Serial Card Validation
- Cannot be empty
- Must be unique within file
- Recommended format: CARD-XXXXXXXXX

### General Rules
- Empty rows are automatically skipped
- Leading/trailing whitespace is trimmed
- Duplicate detection is case-insensitive

## Error Messages

### Common Errors
- **"Invalid or missing email address"** - Email field is empty or invalid format
- **"Missing employee ID"** - Employee ID field is required but empty
- **"Missing serial card number"** - Serial card field is required but empty
- **"Duplicate email address"** - Email appears more than once in the file
- **"Duplicate employee ID"** - Employee ID appears more than once
- **"Duplicate serial card"** - Serial card appears more than once

### SFTP Errors
- **"Connection failed"** - Unable to connect to SFTP server
- **"Authentication failed"** - Invalid credentials
- **"File not found"** - No files matching pattern in remote path
- **"Permission denied"** - Insufficient permissions on SFTP server

## Troubleshooting

### Import Issues

**Problem:** File won't upload
- Check file size (must be under 5MB)
- Verify file format (CSV, XLSX, or XLS only)
- Ensure file is not corrupted

**Problem:** All records show as errors
- Verify column names match required format
- Check that required fields have data
- Ensure email addresses are valid format

**Problem:** Records marked as duplicates
- Review file for duplicate email addresses or IDs
- Remove duplicates before re-uploading

### SFTP Issues

**Problem:** Connection test fails
- Verify host address and port
- Check username and password/key
- Ensure SFTP server is accessible from platform
- Check firewall settings

**Problem:** Files not being imported
- Verify file pattern matches uploaded files
- Check remote path is correct
- Ensure auto-process is enabled
- Review schedule settings

**Problem:** Authentication errors
- Verify credentials are correct
- For SSH keys, ensure correct PEM format
- Check for expired passwords

## Security Considerations

### Data Protection
- All employee data is encrypted in transit and at rest
- Access restricted to authorized administrators only
- Data isolation between different client sites
- Audit logging of all import activities

### SFTP Security
- Use SSH key authentication when possible
- Regularly rotate credentials
- Limit SFTP access to specific IP addresses
- Use dedicated SFTP user with minimal permissions

### Compliance
- Follow GDPR guidelines for employee data
- Obtain necessary consent before importing employee data
- Maintain data retention policies
- Provide employees with access to their data

## Support

For assistance with employee data imports:

1. Review this documentation
2. Check validation error messages
3. Test with template file
4. Contact platform support with:
   - Site name
   - Validation method being used
   - Error messages received
   - Sample data (with sensitive information removed)

## Changelog

### Version 1.0 (February 2026)
- Initial release
- Manual CSV/Excel import
- SFTP automation
- Support for all validation methods
- Real-time validation and error reporting
- Template download functionality
