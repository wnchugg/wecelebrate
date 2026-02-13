/**
 * URL Utility Functions
 * Provides URL parsing and manipulation utilities
 */

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Remove leading ? if present
  const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  
  if (!cleanQuery) return params;
  
  const pairs = cleanQuery.split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  
  return params;
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const parts: string[] = [];
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      );
    }
  }
  
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

/**
 * Add query parameters to a URL
 */
export function addQueryParams(url: string, params: Record<string, any>): string {
  const queryString = buildQueryString(params);
  
  if (!queryString) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString.slice(1)}`;
}

/**
 * Remove query parameters from a URL
 */
export function removeQueryParams(url: string, keys: string[]): string {
  const [baseUrl, queryString] = url.split('?');
  
  if (!queryString) return url;
  
  const params = parseQueryString(queryString);
  
  for (const key of keys) {
    delete params[key];
  }
  
  const newQueryString = buildQueryString(params);
  return newQueryString ? `${baseUrl}${newQueryString}` : baseUrl;
}

/**
 * Get query parameter value from URL
 */
export function getQueryParam(url: string, key: string): string | null {
  const queryString = url.split('?')[1];
  if (!queryString) return null;
  
  const params = parseQueryString(queryString);
  return params[key] || null;
}

/**
 * Update query parameter in URL
 */
export function updateQueryParam(url: string, key: string, value: any): string {
  const [baseUrl, queryString] = url.split('?');
  const params = queryString ? parseQueryString(queryString) : {};
  
  params[key] = value;
  
  const newQueryString = buildQueryString(params);
  return newQueryString ? `${baseUrl}${newQueryString}` : baseUrl;
}

/**
 * Parse URL into components
 */
export function parseUrl(url: string): {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: Record<string, string>;
} {
  try {
    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol.replace(':', ''),
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash.replace('#', ''),
      params: parseQueryString(urlObj.search),
    };
  } catch {
    return {
      protocol: '',
      hostname: '',
      port: '',
      pathname: url,
      search: '',
      hash: '',
      params: {},
    };
  }
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get domain from URL
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Get base URL (protocol + hostname + port)
 */
export function getBaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return '';
  }
}

/**
 * Join URL paths
 */
export function joinPaths(...paths: string[]): string {
  return paths
    .map((path, index) => {
      // Remove leading slash from all but first path
      if (index > 0 && path.startsWith('/')) {
        path = path.slice(1);
      }
      // Remove trailing slash from all but last path
      if (index < paths.length - 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      return path;
    })
    .join('/');
}

/**
 * Normalize URL (remove duplicate slashes, trailing slashes, etc.)
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove duplicate slashes in pathname
    urlObj.pathname = urlObj.pathname.replace(/\/+/g, '/');
    // Remove trailing slash
    if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    return urlObj.toString();
  } catch {
    // If not a valid URL, just clean up slashes
    return url.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }
}

/**
 * Build URL from components
 */
export function buildUrl(components: {
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  params?: Record<string, any>;
  hash?: string;
}): string {
  const {
    protocol = 'https',
    hostname = '',
    port = '',
    pathname = '',
    params = {},
    hash = '',
  } = components;
  
  if (!hostname) return pathname;
  
  let url = `${protocol}://${hostname}`;
  
  if (port) {
    url += `:${port}`;
  }
  
  if (pathname) {
    url += pathname.startsWith('/') ? pathname : `/${pathname}`;
  }
  
  const queryString = buildQueryString(params);
  if (queryString) {
    url += queryString;
  }
  
  if (hash) {
    url += `#${hash}`;
  }
  
  return url;
}

/**
 * Check if URL is absolute
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url);
}

/**
 * Check if URL is relative
 */
export function isRelativeUrl(url: string): boolean {
  return !isAbsoluteUrl(url);
}

/**
 * Sanitize URL (remove dangerous protocols)
 */
export function sanitizeUrl(url: string): string {
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
  const lowerUrl = url.toLowerCase().trim();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return 'about:blank';
    }
  }
  
  return url;
}
