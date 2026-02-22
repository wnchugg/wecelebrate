import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  FileText,
  Loader2,
  Table,
  Save,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  parseCSVFile, 
  parseExcelFile, 
  parsePipeDelimitedFile,
  detectFieldMapping, 
  validateProductData,
  downloadTemplate,
  ImportResult,
  FIELD_MAPPINGS
} from '../../utils/bulkImport';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export function ProductBulkImport() {
  const navigate = useNavigate();
  const { accessToken } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    errors: [] as Array<{ row: number; message: string }>,
  });
  const [importResults, setImportResults] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>('');

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls', 'txt'].includes(fileExtension || '')) {
      toast.error('Invalid file type. Please upload a CSV, Excel, or Pipe Delimited file.');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      let data: Record<string, unknown>[];
      
      if (fileExtension === 'csv') {
        data = await parseCSVFile(selectedFile);
      } else if (fileExtension === 'txt') {
        data = await parsePipeDelimitedFile(selectedFile);
      } else {
        data = await parseExcelFile(selectedFile);
      }

      if (data.length === 0) {
        toast.error('File is empty');
        setIsProcessing(false);
        return;
      }

      setParsedData(data);
      
      // Auto-detect field mapping
      const headers = Object.keys(data[0]);
      const detectedMapping = detectFieldMapping(headers);
      setFieldMapping(detectedMapping);
      
      toast.success(`File loaded successfully. ${data.length} rows found.`);
      setCurrentStep('mapping');
    } catch (error: unknown) {
      console.error('File parsing error:', error);
      toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle field mapping change
  const handleMappingChange = (targetField: string, sourceField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [targetField]: sourceField
    }));
  };

  // Validate data
  const handleValidate = () => {
    setIsProcessing(true);
    
    try {
      const result = validateProductData(parsedData, fieldMapping);
      setValidationResult(result);
      
      if (result.success) {
        toast.success(`Validation successful! ${result.successCount} products ready to import.`);
      } else {
        toast.error(`Validation found ${result.errorCount} errors.`);
      }
      
      setCurrentStep('preview');
    } catch (error: unknown) {
      toast.error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Import products
  const handleImport = async () => {
    if (!validationResult || !selectedSite) {
      toast.error('Please select a site to import products to');
      return;
    }

    setCurrentStep('importing');
    setImportProgress({
      total: 0,
      successful: 0,
      failed: 0,
      errors: [],
    });
    setIsImporting(true);

    try {
      const env = getCurrentEnvironment();
      const productsToImport = validationResult.data;
      const batchSize = 10;
      let successful = 0;
      let failed = 0;
      const errors: Array<{ row: number; message: string }> = [];

      // Import in batches
      for (let i = 0; i < productsToImport.length; i += batchSize) {
        const batch = productsToImport.slice(i, i + batchSize);
        
        try {
          // Extract project ID from supabaseUrl
          const projectIdMatch = env.supabaseUrl.replace('https://', '').split('.')[0];
          
          const response = await fetch(
            `https://${projectIdMatch}.supabase.co/functions/v1/make-server-6fcaeea3/admin/products/bulk-import`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.supabaseAnonKey}`,
                'X-Access-Token': accessToken || '',
                'X-Environment-ID': env.id,
              },
              body: JSON.stringify({
                siteId: selectedSite,
                products: batch
              })
            }
          );

          const result = await response.json();

          if (response.ok) {
            successful += result.successful || batch.length;
          } else {
            failed += batch.length;
            errors.push({
              row: i + 1,
              message: result.error || 'Failed to import batch'
            });
          }
        } catch (error: unknown) {
          failed += batch.length;
          errors.push({
            row: i + 1,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        setImportProgress({
          total: productsToImport.length,
          successful,
          failed,
          errors,
        });
      }

      setImportResults({ successful, failed, errors });
      setCurrentStep('complete');

      if (failed === 0) {
        toast.success(`Successfully imported ${successful} products!`);
      } else {
        toast.warning(`Imported ${successful} products, ${failed} failed.`);
      }
    } catch (error: unknown) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentStep('preview');
    } finally {
      setIsImporting(false);
    }
  };

  // Reset import
  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setFieldMapping({});
    setValidationResult(null);
    setImportProgress({
      total: 0,
      successful: 0,
      failed: 0,
      errors: [],
    });
    setImportResults(null);
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get available source fields
  const getSourceFields = () => {
    if (parsedData.length === 0) return [];
    return Object.keys(parsedData[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void navigate('/admin/gifts')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bulk Product Import</h1>
                <p className="text-sm text-gray-600">Import products from CSV or Excel files</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[
              { key: 'upload', label: 'Upload File', icon: Upload },
              { key: 'mapping', label: 'Map Fields', icon: Settings },
              { key: 'preview', label: 'Preview & Validate', icon: Eye },
              { key: 'importing', label: 'Import', icon: Save },
              { key: 'complete', label: 'Complete', icon: CheckCircle }
            ].map((step, index, array) => {
              const isActive = currentStep === step.key;
              const isCompleted = array.findIndex(s => s.key === currentStep) > index;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-[#D91C81] text-white' : 
                        isCompleted ? 'bg-green-500 text-white' : 
                        'bg-gray-200 text-gray-500'}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-[#D91C81]' : 
                      isCompleted ? 'text-green-600' : 
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < array.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Step */}
        {currentStep === 'upload' && (
          <Card className="p-8">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#D91C81] to-[#B71569] rounded-full flex items-center justify-center mb-6">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Product Data</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Upload a CSV or Excel file containing your product data. Make sure your file includes
                required fields: name, category, and value.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                onChange={() => void handleFileSelect()}
                className="hidden"
                id="file-upload"
              />

              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-8 py-4 rounded-lg font-semibold cursor-pointer hover:shadow-lg transition-all"
              >
                <FileSpreadsheet className="w-5 h-5" />
                {isProcessing ? 'Processing...' : 'Choose File'}
              </label>

              {file && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg inline-block">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-blue-900">{file.name}</p>
                      <p className="text-sm text-blue-600">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <FileSpreadsheet className="w-8 h-8 text-[#D91C81] mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Supported Formats</h3>
                  <p className="text-sm text-gray-600">CSV, XLSX, XLS, TXT files</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Auto-Mapping</h3>
                  <p className="text-sm text-gray-600">Automatically detects column headers</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-[#00B4CC] mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Validation</h3>
                  <p className="text-sm text-gray-600">Validates data before importing</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Mapping Step */}
        {currentStep === 'mapping' && (
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Map Your Fields</h2>
              <p className="text-gray-600">
                Match your file columns to product fields. Required fields are marked with *
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {Object.entries(FIELD_MAPPINGS).map(([targetField, possibleHeaders]) => {
                const isRequired = ['name', 'category', 'value'].includes(targetField);
                const mappedField = fieldMapping[targetField];

                return (
                  <div key={targetField} className="grid md:grid-cols-2 gap-4 items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="font-medium text-gray-900">
                        {targetField.replace(/([A-Z])/g, ' $1').trim()}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Suggested: {possibleHeaders.join(', ')}
                      </p>
                    </div>
                    <select
                      value={mappedField || ''}
                      onChange={(e) => handleMappingChange(targetField, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    >
                      <option value="">-- Not Mapped --</option>
                      {getSourceFields().map(field => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button 
                onClick={handleValidate}
                disabled={!fieldMapping.name || !fieldMapping.category || !fieldMapping.value || isProcessing}
                className="bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Continue to Preview
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && validationResult && (
          <div className="space-y-6">
            {/* Validation Summary */}
            <Card className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Table className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{validationResult.totalRows}</p>
                  <p className="text-sm text-blue-600">Total Rows</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">{validationResult.successCount}</p>
                  <p className="text-sm text-green-600">Valid Products</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-900">{validationResult.errorCount}</p>
                  <p className="text-sm text-red-600">Errors Found</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Save className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">
                    {validationResult.success ? 'Ready' : 'Review'}
                  </p>
                  <p className="text-sm text-purple-600">Import Status</p>
                </div>
              </div>
            </Card>

            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Validation Errors ({validationResult.errors.length})
                </h3>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {validationResult.errors.slice(0, 50).map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Badge variant="destructive" className="text-xs">Row {error.row}</Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">{error.field}</p>
                            <p className="text-xs text-red-600">{error.message}</p>
                            {error.value && (
                              <p className="text-xs text-gray-600 mt-1">Value: {String(error.value)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {validationResult.errors.length > 50 && (
                      <p className="text-sm text-gray-600 text-center py-2">
                        ... and {validationResult.errors.length - 50} more errors
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            )}

            {/* Preview Table */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Data Preview ({validationResult.data.length} products)
              </h3>
              <ScrollArea className="h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Value</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Inventory</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResult.data.slice(0, 100).map((product, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{product.name}</td>
                        <td className="px-4 py-2">{product.category}</td>
                        <td className="px-4 py-2">${product.value.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={product.inventoryStatus === 'in_stock' ? 'default' : 'secondary'}>
                            {product.inventoryStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validationResult.data.length > 100 && (
                  <p className="text-sm text-gray-600 text-center py-4">
                    Showing first 100 of {validationResult.data.length} products
                  </p>
                )}
              </ScrollArea>
            </Card>

            {/* Site Selection */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Select Target Site</h3>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              >
                <option value="">-- Select a Site --</option>
                <option value="site1">Site 1 - Main Catalog</option>
                <option value="site2">Site 2 - Premium Gifts</option>
                <option value="site3">Site 3 - Employee Rewards</option>
              </select>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('mapping')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Mapping
              </Button>
              <Button 
                onClick={() => void handleImport()}
                disabled={validationResult.successCount === 0 || !selectedSite}
                className="bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white"
              >
                Import {validationResult.successCount} Products
                <Save className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Importing Step */}
        {currentStep === 'importing' && (
          <Card className="p-8">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-[#D91C81] mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Importing Products...</h2>
              <p className="text-gray-600 mb-8">
                Please wait while we import your products. This may take a few moments.
              </p>
              <Progress value={importProgress.successful / importProgress.total * 100} className="mb-4" />
              <p className="text-sm text-gray-600">{importProgress.successful} of {importProgress.total} complete</p>
            </div>
          </Card>
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && importResults && (
          <Card className="p-8">
            <div className="text-center">
              <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                importResults.failed === 0 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-br from-yellow-500 to-orange-600'
              }`}>
                {importResults.failed === 0 ? (
                  <CheckCircle className="w-12 h-12 text-white" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Import {importResults.failed === 0 ? 'Complete!' : 'Completed with Errors'}
              </h2>
              <p className="text-gray-600 mb-8">
                {importResults.successful} products imported successfully
                {importResults.failed > 0 && `, ${importResults.failed} failed`}
              </p>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                <div className="p-6 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-green-900">{importResults.successful}</p>
                  <p className="text-sm text-green-600">Successful</p>
                </div>
                <div className="p-6 bg-red-50 rounded-lg">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-red-900">{importResults.failed}</p>
                  <p className="text-sm text-red-600">Failed</p>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="mb-8 text-left max-w-2xl mx-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">Import Errors:</h3>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {importResults.errors.map((error, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-900">
                            <span className="font-medium">Row {error.row}:</span> {error.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  Import More Products
                </Button>
                <Button
                  onClick={() => void navigate('/admin/gifts')}
                  className="bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white"
                >
                  View Products
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}