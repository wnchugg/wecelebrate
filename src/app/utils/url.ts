/**
 * URL Utilities
 * 
 * Handles URL construction for the JALA 2 platform, accounting for
 * Figma Make's iframe preview environment vs production deployment.
 */

/**
 * URL Components interface
 */
export interface URLComponents {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  href: string;
  username?: string;
  password?: string;
}

/**
 * Gets the actual public site origin, handling Figma iframe preview domains.
 * 
 * In Figma Make:
 * - Admin/Preview runs in: https://{uuid}-v2-figmaiframepreview.figma.site
 * - Actual deployed site: https://{site-slug}.figma.site
 * 
 * The UUID and site-slug are DIFFERENT - the UUID is for the preview/admin,
 * while the site-slug is for the deployed public site. We cannot derive one
 * from the other programmatically.
 * 
 * This function:
 * 1. Tries to get the deployed slug from parent window (if in iframe)
 * 2. Checks localStorage for a manually set deployed domain
 * 3. Tries simple suffix removal (works if slug is same)
 * 4. Falls back to current origin if not in preview mode
 */
export function getPublicSiteOrigin(): string {
  const hostname = window.location.hostname;
  
  // Check if we're in a Figma iframe preview environment
  // Pattern: {uuid}-v2-figmaiframepreview.figma.site
  const isPreviewEnvironment = hostname.includes('-v2-figmaiframepreview.figma.site');
  
  if (isPreviewEnvironment) {
    // Option 1: Check if there's a stored deployed domain (highest priority)
    const storedDomain = localStorage.getItem('figma-public-site-domain');
    if (storedDomain) {
      return storedDomain;
    }
    
    // Option 2: Try to get from parent window (if accessible and different)
    try {
      if (window.parent && window.parent !== window && window.parent.location.hostname !== hostname) {
        const parentHostname = window.parent.location.hostname;
        if (parentHostname.includes('.figma.site') && !parentHostname.includes('-v2-figmaiframepreview')) {
          const origin = `https://${parentHostname}`;
          // Cache it for future use
          localStorage.setItem('figma-public-site-domain', origin);
          return origin;
        }
      }
    } catch (e) {
      // Cross-origin access blocked, which is expected
    }
    
    // Option 3: Check top window's location
    try {
      if (window.top && window.top !== window) {
        const topHostname = window.top.location.hostname;
        if (topHostname.includes('.figma.site') && !topHostname.includes('-v2-figmaiframepreview')) {
          const origin = `https://${topHostname}`;
          // Cache it for future use
          localStorage.setItem('figma-public-site-domain', origin);
          return origin;
        }
      }
    } catch (e) {
      // Cross-origin access blocked
    }
    
    // Option 4: Try simple suffix removal (works if the slug happens to be the same)
    // This is unlikely but worth trying
    const withoutSuffix = hostname.replace('-v2-figmaiframepreview', '');
    if (withoutSuffix !== hostname && withoutSuffix.includes('.figma.site')) {
      // Log that we're using this approach
      console.warn('[URL Utils] Using suffix-removal approach for public site URL:', `https://${withoutSuffix}`);
      return `https://${withoutSuffix}`;
    }
    
    // Fallback: We're in preview but can't determine the public domain
    // Return current origin and log a warning
    console.warn(
      '[URL Utils] ⚠️ Running in preview environment but cannot determine public site domain.\n' +
      'Public site links will point to the preview URL which may not be correct.\n\n' +
      'To fix this, add this code to your app initialization:\n' +
      'import { setPublicSiteDomain } from "./utils/url";\n' +
      'setPublicSiteDomain("https://your-actual-site.figma.site");'
    );
  }
  
  // Not in preview mode, or fallback - use the current origin
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}`;
}

/**
 * Constructs a public site URL for a given site ID
 */
export function getPublicSiteUrl(siteId: string): string {
  const origin = getPublicSiteOrigin();
  return `${origin}/site/${siteId}`;
}

/**
 * Stores the deployed site slug for future reference.
 * This should be called when the actual deployed slug is known.
 */
export function setDeployedSlug(slug: string): void {
  localStorage.setItem('figma-deployed-slug', slug);
}

/**
 * Clears the stored deployed slug
 */
export function clearDeployedSlug(): void {
  localStorage.removeItem('figma-deployed-slug');
}

/**
 * Sets the public site domain for use in preview environments.
 * This should be called on app initialization if running in a preview.
 */
export function setPublicSiteDomain(domain: string): void {
  localStorage.setItem('figma-public-site-domain', domain);
}

/**
 * Clears the stored public site domain
 */
export function clearPublicSiteDomain(): void {
  localStorage.removeItem('figma-public-site-domain');
}

/**
 * Validates if a string is a valid URL
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
 * Parses a URL string into its components
 */
export function parseUrl(url: string, base?: string): URLComponents | null {
  try {
    let parsed: URL;
    
    // If base is provided and url is relative, use base
    if (base && !url.startsWith('http')) {
      parsed = new URL(url, base);
    } else {
      parsed = new URL(url);
    }
    
    return {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      origin: parsed.origin,
      href: parsed.href,
      username: parsed.username,
      password: parsed.password,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Checks if two URLs have the same origin (protocol + hostname + port)
 */
export function isSameOrigin(url1: string, url2: string): boolean {
  try {
    const parsed1 = new URL(url1);
    const parsed2 = new URL(url2);
    return parsed1.origin === parsed2.origin;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL by removing potentially dangerous protocols
 */
export function sanitizeUrl(url: string): string {
  try {
    // Decode URL-encoded characters to catch obfuscated protocols
    const decoded = decodeURIComponent(url);
    const lowerUrl = decoded.toLowerCase().trim();
    
    // List of dangerous protocols
    const dangerousProtocols = [
      'javascript:',
      'data:text/html',
      'vbscript:',
      'file:',
      'about:'
    ];
    
    // Check if URL starts with any dangerous protocol
    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        // Return a safe fallback
        return 'about:blank';
      }
    }
    
    // Allow http, https, mailto, tel protocols
    const parsed = new URL(url);
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    
    if (!safeProtocols.includes(parsed.protocol)) {
      return 'about:blank';
    }
    
    return url;
  } catch {
    // If URL parsing fails, return safe fallback
    return 'about:blank';
  }
}

/**
 * Builds a URL from base, path, and query parameters
 */
export function buildUrl(
  base: string,
  path: string,
  params?: Record<string, any>
): string {
  try {
    const url = new URL(path, base);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    
    // Convert + to %20 for consistency (both are valid, but %20 is more standard)
    return url.toString().replace(/\+/g, '%20');
  } catch {
    return base + path;
  }
}

/**
 * Gets query parameters from a URL
 */
export function getQueryParams(url: string): Record<string, string> {
  try {
    const parsed = new URL(url);
    const params: Record<string, string> = {};
    
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  } catch {
    return {};
  }
}

/**
 * Sets a query parameter in a URL
 */
export function setQueryParam(url: string, key: string, value: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set(key, value);
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Removes a query parameter from a URL
 */
export function removeQueryParam(url: string, key: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete(key);
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Gets the base URL (origin) from a URL
 */
export function getBaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return '';
  }
}

/**
 * Gets the domain (hostname) from a URL
 */
export function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return '';
  }
}

/**
 * Gets the path from a URL
 */
export function getPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname;
  } catch {
    return '';
  }
}