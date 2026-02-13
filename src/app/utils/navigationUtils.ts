/**
 * Navigation Utility Functions
 * Provides utilities for programmatic navigation and route handling
 */

/**
 * Navigate to a route programmatically
 */
export function navigateTo(path: string, replace: boolean = false): void {
  if (replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }
  
  // Dispatch popstate event to trigger React Router
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Navigate back in history
 */
export function navigateBack(): void {
  window.history.back();
}

/**
 * Navigate forward in history
 */
export function navigateForward(): void {
  window.history.forward();
}

/**
 * Replace current route
 */
export function replaceRoute(path: string): void {
  navigateTo(path, true);
}

/**
 * Get current route path
 */
export function getCurrentPath(): string {
  return window.location.pathname;
}

/**
 * Get query parameters as object
 */
export function getQueryParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Get single query parameter
 */
export function getQueryParam(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

/**
 * Set query parameters
 */
export function setQueryParams(params: Record<string, string>, replace: boolean = false): void {
  const searchParams = new URLSearchParams(window.location.search);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
  });
  
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  navigateTo(newUrl, replace);
}

/**
 * Remove query parameter
 */
export function removeQueryParam(key: string, replace: boolean = false): void {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete(key);
  
  const newUrl = searchParams.toString()
    ? `${window.location.pathname}?${searchParams.toString()}`
    : window.location.pathname;
  
  navigateTo(newUrl, replace);
}

/**
 * Get hash from URL
 */
export function getHash(): string {
  return window.location.hash.replace('#', '');
}

/**
 * Set hash in URL
 */
export function setHash(hash: string, replace: boolean = false): void {
  const newHash = hash.startsWith('#') ? hash : `#${hash}`;
  const newUrl = `${window.location.pathname}${window.location.search}${newHash}`;
  navigateTo(newUrl, replace);
}

/**
 * Remove hash from URL
 */
export function removeHash(replace: boolean = false): void {
  const newUrl = `${window.location.pathname}${window.location.search}`;
  navigateTo(newUrl, replace);
}

/**
 * Build URL with query parameters
 */
export function buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
  if (!params) return path;
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

/**
 * Parse URL into parts
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
  const urlObj = new URL(url, window.location.origin);
  const params: Record<string, string> = {};
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port,
    pathname: urlObj.pathname,
    search: urlObj.search,
    hash: urlObj.hash,
    params,
  };
}

/**
 * Check if URL is absolute
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Check if URL is relative
 */
export function isRelativeUrl(url: string): boolean {
  return !isAbsoluteUrl(url);
}

/**
 * Join URL paths
 */
export function joinPaths(...paths: string[]): string {
  return paths
    .map((path, index) => {
      if (index === 0) {
        return path.replace(/\/+$/, '');
      }
      return path.replace(/^\/+/, '').replace(/\/+$/, '');
    })
    .filter(Boolean)
    .join('/');
}

/**
 * Normalize URL path
 */
export function normalizePath(path: string): string {
  // Remove duplicate slashes
  path = path.replace(/\/+/g, '/');
  
  // Remove trailing slash (except for root)
  if (path !== '/' && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  
  return path;
}

/**
 * Get base URL
 */
export function getBaseUrl(): string {
  return `${window.location.protocol}//${window.location.host}`;
}

/**
 * Get full URL
 */
export function getFullUrl(): string {
  return window.location.href;
}

/**
 * Check if current URL matches pattern
 */
export function matchesPattern(pattern: string | RegExp): boolean {
  const path = getCurrentPath();
  
  if (typeof pattern === 'string') {
    // Simple string match with wildcards
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\//g, '\\/');
    return new RegExp(`^${regexPattern}$`).test(path);
  }
  
  return pattern.test(path);
}

/**
 * Extract route params from path pattern
 */
export function extractParams(pattern: string, path: string): Record<string, string> {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  const params: Record<string, string> = {};
  
  if (patternParts.length !== pathParts.length) {
    return params;
  }
  
  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1);
      params[paramName] = pathParts[index];
    }
  });
  
  return params;
}

/**
 * Check if route matches pattern with params
 */
export function matchRoute(pattern: string, path: string): {
  matches: boolean;
  params: Record<string, string>;
} {
  const params = extractParams(pattern, path);
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  if (patternParts.length !== pathParts.length) {
    return { matches: false, params: {} };
  }
  
  const matches = patternParts.every((part, index) => {
    return part.startsWith(':') || part === pathParts[index];
  });
  
  return { matches, params: matches ? params : {} };
}

/**
 * Redirect to URL
 */
export function redirect(url: string, external: boolean = false): void {
  if (external || isAbsoluteUrl(url)) {
    window.location.href = url;
  } else {
    navigateTo(url);
  }
}

/**
 * Reload current page
 */
export function reloadPage(force: boolean = false): void {
  if (force) {
    window.location.reload();
  } else {
    const currentPath = getCurrentPath();
    navigateTo(currentPath, true);
  }
}

/**
 * Open URL in new tab/window
 */
export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Get referrer URL
 */
export function getReferrer(): string {
  return document.referrer;
}

/**
 * Check if coming from specific domain
 */
export function isFromDomain(domain: string): boolean {
  const referrer = getReferrer();
  if (!referrer) return false;
  
  try {
    const referrerUrl = new URL(referrer);
    return referrerUrl.hostname === domain;
  } catch {
    return false;
  }
}

/**
 * Get route breadcrumbs
 */
export function getBreadcrumbs(path: string = getCurrentPath()): Array<{ label: string; path: string }> {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; path: string }> = [
    { label: 'Home', path: '/' },
  ];
  
  let currentPath = '';
  parts.forEach((part) => {
    currentPath += `/${part}`;
    breadcrumbs.push({
      label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
      path: currentPath,
    });
  });
  
  return breadcrumbs;
}

/**
 * Safe navigation with error handling
 */
export async function safeNavigate(
  path: string,
  options?: {
    replace?: boolean;
    onError?: (error: Error) => void;
  }
): Promise<boolean> {
  try {
    navigateTo(path, options?.replace);
    return true;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    options?.onError?.(err);
    return false;
  }
}

/**
 * Navigation guard (intercept navigation)
 */
export type NavigationGuard = (to: string, from: string) => boolean | Promise<boolean>;

const navigationGuards: NavigationGuard[] = [];

/**
 * Add navigation guard
 */
export function addNavigationGuard(guard: NavigationGuard): () => void {
  navigationGuards.push(guard);
  
  return () => {
    const index = navigationGuards.indexOf(guard);
    if (index > -1) {
      navigationGuards.splice(index, 1);
    }
  };
}

/**
 * Check navigation guards
 */
export async function checkNavigationGuards(to: string, from: string): Promise<boolean> {
  for (const guard of navigationGuards) {
    const result = await guard(to, from);
    if (!result) {
      return false;
    }
  }
  return true;
}

/**
 * Navigate with guards
 */
export async function navigateWithGuards(path: string, replace: boolean = false): Promise<boolean> {
  const from = getCurrentPath();
  const allowed = await checkNavigationGuards(path, from);
  
  if (allowed) {
    navigateTo(path, replace);
    return true;
  }
  
  return false;
}
