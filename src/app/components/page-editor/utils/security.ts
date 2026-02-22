/**
 * Security utilities for page editor
 * Provides HTML sanitization and input validation
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe rendering
 * Removes potentially dangerous tags and attributes
 */
export const sanitizeHtml = (html: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: string[];
}): string => {
  const defaultConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'div',
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  };

  const config = options ? {
    ALLOWED_TAGS: options.allowedTags || defaultConfig.ALLOWED_TAGS,
    ALLOWED_ATTR: options.allowedAttributes || defaultConfig.ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: defaultConfig.FORBID_TAGS,
    FORBID_ATTR: defaultConfig.FORBID_ATTR,
  } : defaultConfig;

  return DOMPurify.sanitize(html, config);
};

/**
 * Sanitize text content (more restrictive than HTML)
 * Only allows basic formatting tags
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Validate text content length and patterns
 */
export const validateTextContent = (text: string, maxLength: number = 10000): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (text.length > maxLength) {
    errors.push(`Text exceeds maximum length of ${maxLength} characters`);
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    { pattern: /<script/i, message: 'Script tags are not allowed' },
    { pattern: /javascript:/i, message: 'JavaScript URLs are not allowed' },
    { pattern: /on\w+=/i, message: 'Event handlers are not allowed' },
    { pattern: /<iframe/i, message: 'Iframes are not allowed' },
  ];

  for (const { pattern, message } of suspiciousPatterns) {
    if (pattern.test(text)) {
      errors.push(message);
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitize URL to prevent javascript: and data: URLs
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove javascript: and data: URLs
  if (url.toLowerCase().startsWith('javascript:') || 
      url.toLowerCase().startsWith('data:')) {
    return '';
  }
  
  return url;
};

/**
 * Create Content Security Policy for iframe
 */
export const getIframeCSP = (): string => {
  return [
    "default-src 'self'",
    "script-src 'unsafe-inline' 'unsafe-eval'",
    "style-src 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'none'",
    "frame-src 'none'",
    "object-src 'none'",
  ].join('; ');
};

/**
 * Validate block content based on block type
 */
export const validateBlockContent = (blockType: string, content: any): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  switch (blockType) {
    case 'text':
    case 'hero':
      if (content.text) {
        const validation = validateTextContent(content.text);
        errors.push(...validation.errors);
      }
      break;

    case 'image':
      if (content.url && !validateUrl(content.url)) {
        errors.push('Invalid image URL');
      }
      break;

    case 'video':
      if (content.url && !validateUrl(content.url)) {
        errors.push('Invalid video URL');
      }
      break;

    case 'cta-button':
      if (content.url && !validateUrl(content.url)) {
        errors.push('Invalid button URL');
      }
      break;

    case 'custom-html':
      if (content.html) {
        const validation = validateTextContent(content.html, 50000);
        errors.push(...validation.errors);
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
