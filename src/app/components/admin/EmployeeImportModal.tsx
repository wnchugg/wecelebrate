import { useState, useRef } from 'react';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import { logger } from '../../utils/logger';
import { sanitizeImportedData, performSecurityChecks } from '../../utils/fileSecurityHelpers';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Users, FileText, Loader2 } from 'lucide-react';
import type { EmployeeTemplateRow } from '../../types/admin';

interface EmployeeImportModalProps {
  open: boolean;
  onClose: () => void;
  validationType: 'email' | 'employeeId' | 'serialCard' | 'magicLink';
  onImport: (data: EmployeeRecord[]) => void;
}

export interface EmployeeRecord {
  id?: string;
  employeeId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  serialCard?: string;
  status: 'valid' | 'error' | 'duplicate';
  errorMessage?: string;
}

export function EmployeeImportModal({ open, onClose, validationType, onImport }: EmployeeImportModalProps) {
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<EmployeeRecord[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: number;
    errors: number;
    duplicates: number;
  }>({ valid: 0, errors: 0, duplicates: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      // Read file data
      const data = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);
      const worksheet = workbook.getWorksheet(1);
      let jsonData = worksheet.getSheetValues() as unknown[][];

      // SECURITY: Sanitize data to prevent prototype pollution (xlsx vulnerability mitigation)
      jsonData = sanitizeImportedData(jsonData);

      // SECURITY: Perform comprehensive security checks
      const securityCheck = performSecurityChecks(file, jsonData, {
        maxSizeMB: 5,
        allowedExtensions: ['.csv', '.xlsx', '.xls'],
        maxRows: 10000,
        maxCellLength: 500,
      });

      if (!securityCheck.isValid) {
        toast.error(`Security validation failed: ${securityCheck.errors.join(', ')}`);
        logger.error('File security check failed:', securityCheck.errors);
        return;
      }

      if (securityCheck.warnings.length > 0) {
        logger.warn('File security warnings:', securityCheck.warnings);
      }

      // Validate and transform data
      const records: EmployeeRecord[] = jsonData
        .slice(1) // Skip header row
        .filter(row => Array.isArray(row) && row.length > 0) // Filter out empty rows
        .map((row, index) => {
          // Type guard: treat row as array and create object from it
          const rowArray = row as any[];
          // Assuming standard Excel column order: Email, Employee ID, First Name, Last Name, Department, Serial Card
          const record: EmployeeRecord = {
            id: `temp-${index}`,
            email: (rowArray[1] as string) || '',
            employeeId: (rowArray[2] as string) || '',
            firstName: (rowArray[3] as string) || '',
            lastName: (rowArray[4] as string) || '',
            department: (rowArray[5] as string) || '',
            serialCard: (rowArray[6] as string) || '',
            status: 'valid'
          };

          // Validation based on type
          if (validationType === 'email' || validationType === 'magicLink') {
            if (!record.email || !isValidEmail(record.email)) {
              record.status = 'error';
              record.errorMessage = 'Invalid or missing email address';
            }
          }

          if (validationType === 'employeeId') {
            if (!record.employeeId) {
              record.status = 'error';
              record.errorMessage = 'Missing employee ID';
            }
            if (!record.email || !isValidEmail(record.email)) {
              record.status = 'error';
              record.errorMessage = 'Invalid or missing email address';
            }
          }

          if (validationType === 'serialCard') {
            if (!record.serialCard) {
              record.status = 'error';
              record.errorMessage = 'Missing serial card number';
            }
          }

          return record;
        });

      // Check for duplicates
      const emailSet = new Set<string>();
      const employeeIdSet = new Set<string>();
      const serialCardSet = new Set<string>();

      records.forEach(record => {
        if (record.email && emailSet.has(record.email.toLowerCase())) {
          record.status = 'duplicate';
          record.errorMessage = 'Duplicate email address';
        } else if (record.email) {
          emailSet.add(record.email.toLowerCase());
        }

        if (record.employeeId && employeeIdSet.has(record.employeeId)) {
          record.status = 'duplicate';
          record.errorMessage = 'Duplicate employee ID';
        } else if (record.employeeId) {
          employeeIdSet.add(record.employeeId);
        }

        if (record.serialCard && serialCardSet.has(record.serialCard)) {
          record.status = 'duplicate';
          record.errorMessage = 'Duplicate serial card';
        } else if (record.serialCard) {
          serialCardSet.add(record.serialCard);
        }
      });

      // Calculate stats
      const valid = records.filter(r => r.status === 'valid').length;
      const errors = records.filter(r => r.status === 'error').length;
      const duplicates = records.filter(r => r.status === 'duplicate').length;

      setPreviewData(records);
      setValidationResults({ valid, errors, duplicates });
      toast.success(`Processed ${records.length} records`);
    } catch (error) {
      logger.error('Import error:', error);
      toast.error('Failed to process file. Please check the format.');
    } finally {
      setImporting(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleImport = () => {
    const validRecords = previewData.filter(r => r.status === 'valid');
    onImport(validRecords);
    toast.success(`Imported ${validRecords.length} employee records`);
    handleClose();
  };

  const handleClose = () => {
    setPreviewData([]);
    setValidationResults({ valid: 0, errors: 0, duplicates: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = async () => {
    let templateData: EmployeeTemplateRow[] = [];

    if (validationType === 'email' || validationType === 'magicLink') {
      templateData = [
        { 'Email': 'john.doe@company.com', 'First Name': 'John', 'Last Name': 'Doe', 'Department': 'Sales' },
        { 'Email': 'jane.smith@company.com', 'First Name': 'Jane', 'Last Name': 'Smith', 'Department': 'Marketing' }
      ];
    } else if (validationType === 'employeeId') {
      templateData = [
        { 'Employee ID': 'EMP001', 'Email': 'john.doe@company.com', 'First Name': 'John', 'Last Name': 'Doe', 'Department': 'Sales' },
        { 'Employee ID': 'EMP002', 'Email': 'jane.smith@company.com', 'First Name': 'Jane', 'Last Name': 'Smith', 'Department': 'Marketing' }
      ];
    } else if (validationType === 'serialCard') {
      templateData = [
        { 'Serial Card': 'CARD-ABC123XYZ', 'Email': 'john.doe@company.com', 'First Name': 'John', 'Last Name': 'Doe', 'Department': 'Sales' },
        { 'Serial Card': 'CARD-DEF456UVW', 'Email': 'jane.smith@company.com', 'First Name': 'Jane', 'Last Name': 'Smith', 'Department': 'Marketing' }
      ];
    }

    try {
      // Create workbook with ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');
      
      // Add headers
      if (templateData.length > 0) {
        const headers = Object.keys(templateData[0]);
        worksheet.addRow(headers);
        
        // Add data rows
        templateData.forEach(row => {
          worksheet.addRow(Object.values(row));
        });
        
        // Style the header row
        const headerRow = worksheet.getRow(1) as any;
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD91C81' }
        };
      }
      
      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `employee_import_template_${validationType}.xlsx`;
      link.click();
      
      toast.success('Template downloaded');
    } catch (error) {
      logger.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  const getFieldLabel = () => {
    switch (validationType) {
      case 'email':
        return 'Email Address';
      case 'employeeId':
        return 'Employee ID';
      case 'serialCard':
        return 'Serial Card';
      case 'magicLink':
        return 'Email Address';
      default:
        return 'Identifier';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D91C81]" />
            Import Employee Data
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import employee records for {getFieldLabel()} validation
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D91C81] transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => void handleFileUpload(e)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-600">
                  CSV, XLSX, or XLS files (max 5MB)
                </p>
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => void downloadTemplate()}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>

            {/* Preview Section */}
            {previewData.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-900">Valid Records</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{validationResults.valid}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-900">Errors</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{validationResults.errors}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-900">Duplicates</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-900">{validationResults.duplicates}</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Preview ({previewData.length} records)</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
                          {validationType !== 'email' && validationType !== 'magicLink' && (
                            <th className="text-left px-4 py-2 font-semibold text-gray-700">{getFieldLabel()}</th>
                          )}
                          <th className="text-left px-4 py-2 font-semibold text-gray-700">Email</th>
                          <th className="text-left px-4 py-2 font-semibold text-gray-700">Name</th>
                          <th className="text-left px-4 py-2 font-semibold text-gray-700">Department</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewData.slice(0, 100).map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              {record.status === 'valid' && (
                                <Badge className="bg-green-100 text-green-800">Valid</Badge>
                              )}
                              {record.status === 'error' && (
                                <Badge className="bg-red-100 text-red-800">Error</Badge>
                              )}
                              {record.status === 'duplicate' && (
                                <Badge className="bg-yellow-100 text-yellow-800">Duplicate</Badge>
                              )}
                            </td>
                            {validationType === 'employeeId' && (
                              <td className="px-4 py-2 font-mono text-xs">{record.employeeId}</td>
                            )}
                            {validationType === 'serialCard' && (
                              <td className="px-4 py-2 font-mono text-xs">{record.serialCard}</td>
                            )}
                            <td className="px-4 py-2 font-mono text-xs">{record.email}</td>
                            <td className="px-4 py-2">
                              {record.firstName} {record.lastName}
                            </td>
                            <td className="px-4 py-2">{record.department}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewData.length > 100 && (
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-sm text-gray-600">
                      Showing first 100 of {previewData.length} records
                    </div>
                  )}
                </div>

                {validationResults.errors > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validationResults.errors} record(s) have validation errors and will not be imported.
                      {validationResults.duplicates > 0 && ` ${validationResults.duplicates} duplicate(s) detected.`}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Follow these guidelines to ensure successful import
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Required Columns</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {validationType === 'email' || validationType === 'magicLink' ? (
                    <li><span className="font-medium">Email</span> - Valid email address (required)</li>
                  ) : null}
                  {validationType === 'employeeId' ? (
                    <>
                      <li><span className="font-medium">Employee ID</span> - Unique employee identifier (required)</li>
                      <li><span className="font-medium">Email</span> - Valid email address (required)</li>
                    </>
                  ) : null}
                  {validationType === 'serialCard' ? (
                    <>
                      <li><span className="font-medium">Serial Card</span> - Unique card number (required)</li>
                      <li><span className="font-medium">Email</span> - Valid email address (optional but recommended)</li>
                    </>
                  ) : null}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Optional Columns</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li><span className="font-medium">First Name</span> - Employee first name</li>
                  <li><span className="font-medium">Last Name</span> - Employee last name</li>
                  <li><span className="font-medium">Department</span> - Department or team name</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">File Format</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Supported formats: CSV, XLSX, XLS</li>
                  <li>First row must contain column headers</li>
                  <li>Column names are case-insensitive</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Recommended maximum: 10,000 records per file</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Validation Rules</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Email addresses must be valid format</li>
                  <li>Duplicate entries within the file will be flagged</li>
                  <li>All required fields must have values</li>
                  <li>Empty rows will be skipped</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {previewData.length > 0 && validationResults.valid > 0 && (
            <Button 
              onClick={handleImport}
              className="bg-[#D91C81] hover:bg-[#B01669] text-white"
              disabled={importing}
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {validationResults.valid} Records
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}