import { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, FileText, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import type { ParsedEmployee } from '../../types/admin';

interface Client {
  id: string;
  name: string;
}

interface ManualEmployeeUploadProps {
  client: Client;
  onUploadComplete: () => void;
}

interface UploadResult {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  errors?: Array<{ row: number; field: string; message: string }>;
}

export function ManualEmployeeUpload({ client, onUploadComplete }: ManualEmployeeUploadProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csv = [
      'email,employeeId,name,department,country,region,location,serialCard',
      'john.doe@company.com,EMP001,John Doe,Engineering,USA,West,San Francisco,CARD12345',
      'jane.smith@company.com,EMP002,Jane Smith,Marketing,USA,East,New York,CARD12346',
      'alex.johnson@company.com,EMP003,Alex Johnson,Sales,Canada,Central,Toronto,CARD12347',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccessToast('Template downloaded successfully');
  };

  const parseCSV = (text: string): ParsedEmployee[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const employees: ParsedEmployee[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const employee: ParsedEmployee = {} as ParsedEmployee;
      
      headers.forEach((header, index) => {
        if (values[index]) {
          employee[header] = values[index];
        }
      });
      
      // Map common variations
      if (employee.employeeid && !employee.employeeId) {
        employee.employeeId = employee.employeeid;
      }
      if (employee.serialcard && !employee.serialCard) {
        employee.serialCard = employee.serialcard;
      }
      
      employees.push(employee);
    }
    
    return employees;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setUploadResult(null);
    
    try {
      const text = await selectedFile.text();
      const employees = parseCSV(text);
      
      if (employees.length === 0) {
        showErrorToast('No valid employees found in CSV', 'Please check the file format');
        return;
      }
      
      const result = await apiRequest<UploadResult>(`/clients/${client.id}/employees/import`, {
        method: 'POST',
        body: JSON.stringify({ employees })
      });
      
      setUploadResult(result);
      
      if (result.errors && result.errors.length > 0) {
        showErrorToast(
          `Imported ${result.imported} employees with ${result.errors.length} errors`, 
          'Check the results below'
        );
      } else {
        showSuccessToast(`Successfully imported ${result.imported} employees`);
      }
      
      onUploadComplete();
    } catch (error: unknown) {
      showErrorToast('Import failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsImporting(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <FileText className="w-5 h-5 text-[#D91C81] mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How to Upload Employee Data</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Download the CSV template below</li>
                <li>Fill in your employee data following the template format</li>
                <li>Include these required fields: email, employeeId, name</li>
                <li>Optional fields for site mapping: department, country, region, location</li>
                <li>Upload the completed CSV file</li>
                <li>Review the import results and configure site mapping rules if needed</li>
              </ol>
            </div>
          </div>

          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upload Employee CSV File</h3>
          
          <div className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D91C81] transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="employee-csv-upload"
              />
              <label htmlFor="employee-csv-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-600">CSV files only (Max 10MB)</p>
              </label>
            </div>

            {/* Selected File */}
            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-600">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={() => void handleUpload()}
              disabled={!selectedFile || isImporting}
              className="w-full bg-[#D91C81] hover:bg-[#B01669] text-white"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Employees
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {uploadResult && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Import Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">Imported</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{uploadResult.imported}</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Updated</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{uploadResult.updated}</p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-medium text-gray-900">Skipped</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{uploadResult.skipped}</p>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-900">Errors</span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {uploadResult.errors?.length || 0}
                </p>
              </div>
            </div>

            {/* Errors */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Error Details:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                      <span className="font-medium text-red-900">Row {error.row}:</span>{' '}
                      <span className="text-red-700">{error.field} - {error.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadResult.success && !uploadResult.errors?.length && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Import completed successfully!</p>
                    <p className="text-xs text-green-700 mt-1">
                      All employees have been imported. You can now configure site mapping rules to automatically assign employees to sites.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Field Mapping Reference */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">CSV Field Reference</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Field Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Required</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">email</td>
                  <td className="px-4 py-2"><Badge className="bg-red-100 text-red-800 text-xs">Required</Badge></td>
                  <td className="px-4 py-2 text-gray-600">Employee email address</td>
                  <td className="px-4 py-2 text-gray-600">john.doe@company.com</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">employeeId</td>
                  <td className="px-4 py-2"><Badge className="bg-red-100 text-red-800 text-xs">Required</Badge></td>
                  <td className="px-4 py-2 text-gray-600">Unique employee identifier</td>
                  <td className="px-4 py-2 text-gray-600">EMP001</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">name</td>
                  <td className="px-4 py-2"><Badge className="bg-red-100 text-red-800 text-xs">Required</Badge></td>
                  <td className="px-4 py-2 text-gray-600">Full name</td>
                  <td className="px-4 py-2 text-gray-600">John Doe</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">department</td>
                  <td className="px-4 py-2"><Badge className="bg-blue-100 text-blue-800 text-xs">Optional</Badge></td>
                  <td className="px-4 py-2 text-gray-600">Department name (for mapping)</td>
                  <td className="px-4 py-2 text-gray-600">Engineering</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">country</td>
                  <td className="px-4 py-2"><Badge className="bg-blue-100 text-blue-800 text-xs">Optional</Badge></td>
                  <td className="px-4 py-2 text-gray-600">Country (for mapping)</td>
                  <td className="px-4 py-2 text-gray-600">USA</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">region</td>
                  <td className="px-4 py-2"><Badge className="bg-blue-100 text-blue-800 text-xs">Optional</Badge></td>
                  <td className="px-4 py-2 text-gray-600">Region (for mapping)</td>
                  <td className="px-4 py-2 text-gray-600">West</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">location</td>
                  <td className="px-4 py-2"><Badge className="bg-blue-100 text-blue-800 text-xs">Optional</Badge></td>
                  <td className="px-4 py-2 text-gray-600">Office location (for mapping)</td>
                  <td className="px-4 py-2 text-gray-600">San Francisco</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">serialCard</td>
                  <td className="px-4 py-2"><Badge className="bg-blue-100 text-blue-800 text-xs">Optional</Badge></td>
                  <td className="px-4 py-2 text-gray-600">Serial card number for validation</td>
                  <td className="px-4 py-2 text-gray-600">CARD12345</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}