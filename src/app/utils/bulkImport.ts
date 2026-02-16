import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { sanitizeImportedData, performSecurityChecks } from './fileSecurityHelpers';

export interface ProductData {
  name: string;
  description?: string;
  longDescription?: string;
  category: string;
  value: number;
  retailValue?: number;
  imageUrl?: string;
  features?: string;
  specifications?: string;
  status: 'active' | 'inactive' | 'discontinued';
  available: boolean;
  inventoryStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
  priority?: number;
  quantityLimit?: number;
  sku?: string;
  tags?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ValidationError[];
  data: ProductData[];
}

// Field mapping configuration
export const FIELD_MAPPINGS = {
  name: ['name', 'product_name', 'gift_name', 'title'],
  description: ['description', 'desc', 'short_description'],
  longDescription: ['long_description', 'detailed_description', 'full_description'],
  category: ['category', 'type', 'product_type', 'gift_category'],
  value: ['value', 'price', 'amount', 'gift_value'],
  retailValue: ['retail_value', 'retail_price', 'msrp', 'original_price'],
  imageUrl: ['image_url', 'image', 'photo', 'picture_url'],
  features: ['features', 'highlights', 'key_features'],
  specifications: ['specifications', 'specs', 'details'],
  status: ['status', 'product_status', 'state'],
  available: ['available', 'is_available', 'in_stock'],
  inventoryStatus: ['inventory_status', 'stock_status', 'availability'],
  priority: ['priority', 'sort_order', 'display_order'],
  quantityLimit: ['quantity_limit', 'max_quantity', 'limit'],
  sku: ['sku', 'product_code', 'item_code'],
  tags: ['tags', 'labels', 'keywords']
};

// Required fields
const REQUIRED_FIELDS = ['name', 'category', 'value'];

// Parse CSV file
export async function parseCSVFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  });
}

// Parse pipe-delimited TXT file
export async function parsePipeDelimitedFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: '|', // Pipe delimiter
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`Pipe-delimited file parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  });
}

// Parse Excel file
export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data as ArrayBuffer);
        
        // Get first worksheet
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
          reject(new Error('No worksheet found in Excel file'));
          return;
        }
        
        // Convert worksheet to JSON
        const jsonData: any[] = [];
        const headers: string[] = [];
        
        // Get headers from first row
        const headerRow = worksheet.getRow(1) as any;
        headerRow.eachCell((cell: any, colNumber: any) => {
          headers[colNumber - 1] = String(cell.value || '');
        });
        
        // Get data rows (skip header row)
        worksheet.eachRow((row: any, rowNumber: any) => {
          if (rowNumber === 1) return; // Skip header row
          
          const rowData: any = {};
          row.eachCell((cell: any, colNumber: any) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowData[header] = cell.value;
            }
          });
          
          // Only add non-empty rows
          if (Object.keys(rowData).length > 0) {
            jsonData.push(rowData);
          }
        });
        
        // SECURITY: Sanitize data to prevent prototype pollution
        const sanitizedData = sanitizeImportedData(jsonData);
        
        // SECURITY: Perform comprehensive security checks
        const securityCheck = performSecurityChecks(file, sanitizedData, {
          maxSizeMB: 10,
          allowedExtensions: ['.xlsx', '.xls'],
          maxRows: 50000,
          maxCellLength: 5000,
        });

        if (!securityCheck.isValid) {
          reject(new Error(`Security validation failed: ${securityCheck.errors.join(', ')}`));
          return;
        }

        if (securityCheck.warnings.length > 0) {
          console.warn('File security warnings:', securityCheck.warnings);
        }
        
        // Normalize headers
        const normalizedData = sanitizedData.map((row: any) => {
          const normalizedRow: any = {};
          Object.keys(row).forEach(key => {
            const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
            normalizedRow[normalizedKey] = row[key];
          });
          return normalizedRow;
        });
        
        resolve(normalizedData);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Auto-detect field mapping
export function detectFieldMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  Object.entries(FIELD_MAPPINGS).forEach(([targetField, possibleHeaders]) => {
    const found = headers.find(header => 
      possibleHeaders.includes(header.toLowerCase().trim())
    );
    if (found) {
      mapping[targetField] = found;
    }
  });
  
  return mapping;
}

// Validate product data
export function validateProductData(data: any[], mapping: Record<string, string>): ImportResult {
  const errors: ValidationError[] = [];
  const validData: ProductData[] = [];
  
  data.forEach((row, index) => {
    const rowNumber = index + 2; // Account for header row and 0-based index
    const product: Partial<ProductData> = {};
    
    // Map fields
    Object.entries(mapping).forEach(([targetField, sourceField]) => {
      if (row[sourceField] !== undefined && row[sourceField] !== '') {
        // Type-safe assignment using Record indexing
        (product as any)[targetField] = row[sourceField];
      }
    });
    
    // Validate required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!product[field as keyof ProductData]) {
        errors.push({
          row: rowNumber,
          field,
          value: product[field as keyof ProductData],
          message: `${field} is required`
        });
      }
    });
    
    // Validate name
    if (product.name && product.name.length < 2) {
      errors.push({
        row: rowNumber,
        field: 'name',
        value: product.name,
        message: 'Name must be at least 2 characters'
      });
    }
    
    if (product.name && product.name.length > 200) {
      errors.push({
        row: rowNumber,
        field: 'name',
        value: product.name,
        message: 'Name must be less than 200 characters'
      });
    }
    
    // Validate and parse value
    if (product.value !== undefined) {
      const value = parseFloat(String(product.value).replace(/[^0-9.-]/g, ''));
      if (isNaN(value) || value < 0) {
        errors.push({
          row: rowNumber,
          field: 'value',
          value: product.value,
          message: 'Value must be a positive number'
        });
      } else {
        product.value = value;
      }
    }
    
    // Validate and parse retail value
    if (product.retailValue !== undefined && String(product.retailValue) !== '') {
      const retailValue = parseFloat(String(product.retailValue).replace(/[^0-9.-]/g, ''));
      if (isNaN(retailValue) || retailValue < 0) {
        errors.push({
          row: rowNumber,
          field: 'retailValue',
          value: product.retailValue,
          message: 'Retail value must be a positive number'
        });
      } else {
        product.retailValue = retailValue;
      }
    }
    
    // Validate priority
    if (product.priority !== undefined && String(product.priority) !== '') {
      const priority = parseInt(String(product.priority));
      if (isNaN(priority)) {
        errors.push({
          row: rowNumber,
          field: 'priority',
          value: product.priority,
          message: 'Priority must be a number'
        });
      } else {
        product.priority = priority;
      }
    }
    
    // Validate quantity limit
    if (product.quantityLimit !== undefined && String(product.quantityLimit) !== '') {
      const limit = parseInt(String(product.quantityLimit));
      if (isNaN(limit) || limit < 1) {
        errors.push({
          row: rowNumber,
          field: 'quantityLimit',
          value: product.quantityLimit,
          message: 'Quantity limit must be a positive number'
        });
      } else {
        product.quantityLimit = limit;
      }
    }
    
    // Validate status
    if (product.status) {
      const validStatuses: Array<'active' | 'inactive' | 'discontinued'> = ['active', 'inactive', 'discontinued'];
      const normalizedStatus = String(product.status).toLowerCase() as 'active' | 'inactive' | 'discontinued';
      if (!validStatuses.includes(normalizedStatus)) {
        errors.push({
          row: rowNumber,
          field: 'status',
          value: product.status,
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      } else {
        product.status = normalizedStatus;
      }
    } else {
      product.status = 'active';
    }
    
    // Validate available
    if (product.available !== undefined) {
      const boolValue = String(product.available).toLowerCase();
      if (['true', '1', 'yes', 'y'].includes(boolValue)) {
        product.available = true;
      } else if (['false', '0', 'no', 'n'].includes(boolValue)) {
        product.available = false;
      } else {
        errors.push({
          row: rowNumber,
          field: 'available',
          value: product.available,
          message: 'Available must be true/false or yes/no'
        });
      }
    } else {
      product.available = true;
    }
    
    // Validate inventory status
    if (product.inventoryStatus) {
      const validStatuses: Array<'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order'> = ['in_stock', 'low_stock', 'out_of_stock', 'pre_order'];
      const normalizedStatus = String(product.inventoryStatus).toLowerCase().replace(/\s+/g, '_') as 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
      if (!validStatuses.includes(normalizedStatus)) {
        errors.push({
          row: rowNumber,
          field: 'inventoryStatus',
          value: product.inventoryStatus,
          message: `Inventory status must be one of: ${validStatuses.join(', ')}`
        });
      } else {
        product.inventoryStatus = normalizedStatus;
      }
    } else {
      product.inventoryStatus = 'in_stock';
    }
    
    // Validate image URL
    if (product.imageUrl && product.imageUrl.trim()) {
      try {
        new URL(product.imageUrl);
      } catch {
        errors.push({
          row: rowNumber,
          field: 'imageUrl',
          value: product.imageUrl,
          message: 'Image URL must be a valid URL'
        });
      }
    }
    
    // Only add if no critical errors for this row
    const rowErrors = errors.filter(e => e.row === rowNumber);
    if (rowErrors.length === 0 || !rowErrors.some(e => REQUIRED_FIELDS.includes(e.field))) {
      validData.push(product as ProductData);
    }
  });
  
  return {
    success: errors.length === 0,
    totalRows: data.length,
    successCount: validData.length,
    errorCount: errors.length,
    errors,
    data: validData
  };
}

// Generate sample CSV template
export function generateSampleCSV(): string {
  const headers = [
    'name',
    'description',
    'long_description',
    'category',
    'value',
    'retail_value',
    'image_url',
    'features',
    'specifications',
    'status',
    'available',
    'inventory_status',
    'priority',
    'quantity_limit',
    'sku',
    'tags'
  ];
  
  const sampleRows = [
    [
      'Premium Headphones',
      'High-quality wireless headphones',
      'Experience superior sound quality with these premium wireless headphones featuring noise cancellation and 30-hour battery life.',
      'Electronics',
      '299.99',
      '399.99',
      'https://example.com/headphones.jpg',
      'Noise Cancellation|30hr Battery|Wireless',
      'Color: Black|Weight: 250g|Bluetooth: 5.0',
      'active',
      'true',
      'in_stock',
      '1',
      '5',
      'HDN-001',
      'electronics,audio,wireless'
    ],
    [
      'Yoga Mat',
      'Eco-friendly yoga mat',
      'Non-slip yoga mat made from sustainable materials, perfect for all types of yoga practice.',
      'Sports & Fitness',
      '45.00',
      '59.99',
      'https://example.com/yoga-mat.jpg',
      'Non-slip|Eco-friendly|6mm Thick',
      'Material: TPE|Size: 72x24 inches|Thickness: 6mm',
      'active',
      'yes',
      'in_stock',
      '2',
      '',
      'YM-002',
      'fitness,yoga,wellness'
    ]
  ];
  
  return Papa.unparse({
    fields: headers,
    data: sampleRows
  });
}

// Download CSV template
export function downloadTemplate(): void {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'product_import_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}