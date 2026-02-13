/**
 * File Utility Functions
 * Provides file handling and manipulation utilities
 */

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Read file as data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as array buffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target?.result as ArrayBuffer);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Download text as file
 */
export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Download JSON as file
 */
export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadTextFile(json, filename, 'application/json');
}

/**
 * Download CSV as file
 */
export function downloadCSV(data: string[][], filename: string): void {
  const csv = data.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  downloadTextFile(csv, filename, 'text/csv');
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot + 1).toLowerCase();
}

/**
 * Get filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? filename : filename.substring(0, lastDot);
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();
  
  return allowedTypes.some(type => {
    // Check by extension
    if (type.startsWith('.')) {
      return extension === type.substring(1).toLowerCase();
    }
    // Check by MIME type (supports wildcards like image/*)
    if (type.includes('*')) {
      const pattern = type.replace('*', '.*');
      return new RegExp(`^${pattern}$`).test(mimeType);
    }
    return mimeType === type.toLowerCase();
  });
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Validate multiple files
 */
export function validateFiles(
  files: File[],
  options: {
    allowedTypes?: string[];
    maxSizeInMB?: number;
    maxFiles?: number;
  } = {}
): {
  valid: File[];
  invalid: Array<{ file: File; reason: string }>;
} {
  const { allowedTypes, maxSizeInMB, maxFiles } = options;
  
  const valid: File[] = [];
  const invalid: Array<{ file: File; reason: string }> = [];
  
  if (maxFiles && files.length > maxFiles) {
    return {
      valid: [],
      invalid: files.map(file => ({
        file,
        reason: `Too many files. Maximum is ${maxFiles}.`,
      })),
    };
  }
  
  for (const file of files) {
    if (allowedTypes && !isValidFileType(file, allowedTypes)) {
      invalid.push({
        file,
        reason: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      });
      continue;
    }
    
    if (maxSizeInMB && !isValidFileSize(file, maxSizeInMB)) {
      invalid.push({
        file,
        reason: `File too large. Maximum size is ${maxSizeInMB}MB.`,
      });
      continue;
    }
    
    valid.push(file);
  }
  
  return { valid, invalid };
}

/**
 * Convert data URL to blob
 */
export function dataURLToBlob(dataURL: string): Blob | null {
  try {
    const parts = dataURL.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    
    if (!mimeMatch) return null;
    
    const mime = mimeMatch[1];
    const byteString = atob(parts[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([arrayBuffer], { type: mime });
  } catch {
    return null;
  }
}

/**
 * Convert blob to data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to convert blob to data URL'));
    };
    
    reader.readAsDataURL(blob);
  });
}

/**
 * Compress image file
 */
export function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    mimeType?: string;
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    mimeType = 'image/jpeg',
  } = options;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          mimeType,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Create file from text
 */
export function createFile(content: string, filename: string, mimeType: string = 'text/plain'): File {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

/**
 * Parse CSV file
 */
export async function parseCSV(file: File): Promise<string[][]> {
  const text = await readFileAsText(file);
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    const cells: string[] = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(cell);
        cell = '';
      } else {
        cell += char;
      }
    }
    
    cells.push(cell);
    return cells;
  });
}

/**
 * Check if file is image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if file is video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * Check if file is audio
 */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

/**
 * Check if file is PDF
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf';
}
