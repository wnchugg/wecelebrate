/**
 * File Security Helpers
 * 
 * Security utilities for file processing, specifically designed to mitigate
 * risks when working with the xlsx library (which has known vulnerabilities).
 * 
 * See /SECURITY.md for details on the xlsx vulnerability acceptance.
 */

/**
 * Validates file size before processing
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validates file type using both extension and MIME type
 */
export function validateFileType(
  file: File,
  allowedExtensions: string[],
  allowedMimeTypes?: string[]
): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension || !allowedExtensions.includes(`.${extension}`)) {
    return false;
  }
  
  if (allowedMimeTypes && allowedMimeTypes.length > 0) {
    return allowedMimeTypes.includes(file.type);
  }
  
  return true;
}

/**
 * Sanitizes object keys to prevent prototype pollution
 * 
 * This is a defense-in-depth measure for the xlsx prototype pollution vulnerability.
 * It removes dangerous keys that could affect object prototypes.
 */
export function sanitizeObjectKeys<T extends Record<string, any>>(obj: T): T {
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  // Create object with null prototype to avoid __proto__ being in prototype chain
  const sanitized: Record<string, any> = Object.create(null);
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Skip dangerous keys
      if (dangerousKeys.includes(key.toLowerCase())) {
        console.warn(`Security: Removed dangerous key "${key}" from imported data`);
        continue;
      }
      
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized as T;
}

/**
 * Sanitizes an array of objects (typical xlsx output)
 */
export function sanitizeImportedData<T extends Record<string, any>>(
  data: T[]
): T[] {
  return data.map(row => sanitizeObjectKeys(row));
}

/**
 * Validates that a string doesn't contain ReDoS patterns
 * 
 * Basic check for patterns that could trigger Regular Expression Denial of Service
 */
export function validateStringForReDoS(str: string, maxLength: number = 10000): boolean {
  // Check length
  if (str.length > maxLength) {
    return false;
  }
  
  // Check for excessive repetition patterns that could trigger ReDoS
  const suspiciousPatterns = [
    /(.)\1{100,}/, // Same character repeated 100+ times
    /(\w+\s+){100,}/, // Many repeated word patterns
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(str)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Complete security check for imported file data
 */
export interface FileSecurityCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function performSecurityChecks(
  file: File,
  data: any[],
  options: {
    maxSizeMB?: number;
    allowedExtensions?: string[];
    maxRows?: number;
    maxCellLength?: number;
  } = {}
): FileSecurityCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate file size
  const maxSizeMB = options.maxSizeMB ?? 10;
  if (!validateFileSize(file, maxSizeMB)) {
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }
  
  // Validate file type
  const allowedExtensions = options.allowedExtensions ?? ['.csv', '.xlsx', '.xls'];
  if (!validateFileType(file, allowedExtensions)) {
    errors.push(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
  }
  
  // Validate row count
  const maxRows = options.maxRows ?? 10000;
  if (data.length > maxRows) {
    errors.push(`Too many rows (${data.length}). Maximum: ${maxRows}`);
  }
  
  // Check for empty data
  if (data.length === 0) {
    errors.push('File contains no data');
  }
  
  // Validate cell content
  const maxCellLength = options.maxCellLength ?? 5000;
  let cellValidationErrors = 0;
  
  for (let i = 0; i < Math.min(data.length, 100); i++) {
    const row = data[i];
    for (const key in row) {
      const value = String(row[key] ?? '');
      
      if (value.length > maxCellLength) {
        cellValidationErrors++;
        if (cellValidationErrors === 1) {
          warnings.push(`Some cells exceed ${maxCellLength} character limit`);
        }
      }
      
      if (!validateStringForReDoS(value, maxCellLength)) {
        errors.push(`Suspicious content detected in row ${i + 1}, column ${key}`);
        break;
      }
    }
    
    if (errors.length > 0) break;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Example usage:
 * 
 * ```typescript
 * import ExcelJS from 'exceljs';
 * import { sanitizeImportedData, performSecurityChecks } from './fileSecurityHelpers';
 * 
 * async function processFile(file: File) {
 *   const data = await file.arrayBuffer();
 *   const workbook = new ExcelJS.Workbook();
 *   await workbook.xlsx.load(data);
 *   const worksheet = workbook.worksheets[0];
 *   
 *   // Convert to JSON (manual iteration)
 *   const jsonData: any[] = [];
 *   const headers: string[] = [];
 *   
 *   worksheet.getRow(1).eachCell((cell, colNumber) => {
 *     headers[colNumber - 1] = String(cell.value || '');
 *   });
 *   
 *   worksheet.eachRow((row, rowNumber) => {
 *     if (rowNumber === 1) return;
 *     const rowData: any = {};
 *     row.eachCell((cell, colNumber) => {
 *       const header = headers[colNumber - 1];
 *       if (header) rowData[header] = cell.value;
 *     });
 *     jsonData.push(rowData);
 *   });
 *   
 *   // Sanitize data to prevent prototype pollution
 *   const sanitizedData = sanitizeImportedData(jsonData);
 *   
 *   // Perform security checks
 *   const securityCheck = performSecurityChecks(file, sanitizedData);
 *   
 *   if (!securityCheck.isValid) {
 *     throw new Error(securityCheck.errors.join(', '));
 *   }
 *   
 *   if (securityCheck.warnings.length > 0) {
 *     console.warn('Security warnings:', securityCheck.warnings);
 *   }
 *   
 *   // Continue with validated and sanitized data
 *   return sanitizedData;
 * }
 * ```
 */