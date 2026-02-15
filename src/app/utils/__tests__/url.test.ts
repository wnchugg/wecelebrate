/**
 * URL Utils Test Suite
 * Day 3 - Afternoon Session
 * Tests for src/app/utils/url.ts
 */

import { describe, it, expect } from 'vitest';
import {
  parseUrl,
  buildUrl,
  getQueryParams,
  setQueryParam,
  removeQueryParam,
  isValidUrl,
  getBaseUrl,
  getDomain,
  getPath,
  isSameOrigin,
  sanitizeUrl
} from '../url';

describe('URL Utils', () => {
  describe('URL Parsing', () => {
    it('should parse simple URL', () => {
      const parsed = parseUrl('https://example.com/path');
      
      expect(parsed.protocol).toBe('https:');
      expect(parsed.hostname).toBe('example.com');
      expect(parsed.pathname).toBe('/path');
    });

    it('should parse URL with port', () => {
      const parsed = parseUrl('https://example.com:8080/path');
      
      expect(parsed.hostname).toBe('example.com');
      expect(parsed.port).toBe('8080');
    });

    it('should parse URL with query parameters', () => {
      const parsed = parseUrl('https://example.com/path?key=value&foo=bar');
      
      expect(parsed.search).toBe('?key=value&foo=bar');
    });

    it('should parse URL with hash', () => {
      const parsed = parseUrl('https://example.com/path#section');
      
      expect(parsed.hash).toBe('#section');
    });

    it('should parse URL with username and password', () => {
      const parsed = parseUrl('https://user:pass@example.com/path');
      
      expect(parsed.username).toBe('user');
      expect(parsed.password).toBe('pass');
    });

    it('should parse relative URL', () => {
      const parsed = parseUrl('/path/to/page', 'https://example.com');
      
      expect(parsed.pathname).toBe('/path/to/page');
    });

    it('should handle invalid URL gracefully', () => {
      const parsed = parseUrl('not a url');
      
      expect(parsed).toBeNull();
    });

    it('should parse complex URL', () => {
      const url = 'https://user:pass@example.com:8080/path/to/page?key=value&arr[]=1&arr[]=2#section';
      const parsed = parseUrl(url);
      
      expect(parsed).toBeDefined();
      expect(parsed.protocol).toBe('https:');
    });
  });

  describe('URL Building', () => {
    it('should build simple URL', () => {
      const url = buildUrl('https://example.com', '/path');
      
      expect(url).toBe('https://example.com/path');
    });

    it('should build URL with query parameters', () => {
      const url = buildUrl('https://example.com', '/path', { key: 'value', foo: 'bar' });
      
      expect(url).toContain('key=value');
      expect(url).toContain('foo=bar');
    });

    it('should build URL with array parameters', () => {
      const url = buildUrl('https://example.com', '/path', { ids: ['1', '2', '3'] });
      
      expect(url).toContain('ids');
    });

    it('should handle empty parameters object', () => {
      const url = buildUrl('https://example.com', '/path', {});
      
      expect(url).toBe('https://example.com/path');
    });

    it('should handle undefined parameters', () => {
      const url = buildUrl('https://example.com', '/path', undefined);
      
      expect(url).toBe('https://example.com/path');
    });

    it('should encode special characters in parameters', () => {
      const url = buildUrl('https://example.com', '/path', { query: 'hello world' });
      
      expect(url).toContain('hello%20world');
    });

    it('should handle numeric parameters', () => {
      const url = buildUrl('https://example.com', '/path', { page: 1, limit: 10 });
      
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
    });

    it('should handle boolean parameters', () => {
      const url = buildUrl('https://example.com', '/path', { active: true, deleted: false });
      
      expect(url).toContain('active=true');
      expect(url).toContain('deleted=false');
    });
  });

  describe('Query Parameter Extraction', () => {
    it('should get single query parameter', () => {
      const url = 'https://example.com/path?key=value';
      const params = getQueryParams(url);
      
      expect(params.key).toBe('value');
    });

    it('should get multiple query parameters', () => {
      const url = 'https://example.com/path?key1=value1&key2=value2&key3=value3';
      const params = getQueryParams(url);
      
      expect(params.key1).toBe('value1');
      expect(params.key2).toBe('value2');
      expect(params.key3).toBe('value3');
    });

    it('should handle empty query string', () => {
      const url = 'https://example.com/path';
      const params = getQueryParams(url);
      
      expect(Object.keys(params).length).toBe(0);
    });

    it('should decode URL-encoded parameters', () => {
      const url = 'https://example.com/path?message=hello%20world';
      const params = getQueryParams(url);
      
      expect(params.message).toBe('hello world');
    });

    it('should handle array parameters', () => {
      const url = 'https://example.com/path?ids[]=1&ids[]=2&ids[]=3';
      const params = getQueryParams(url);
      
      expect(params['ids[]']).toBeDefined();
    });

    it('should handle duplicate parameter names', () => {
      const url = 'https://example.com/path?tag=red&tag=blue&tag=green';
      const params = getQueryParams(url);
      
      expect(params.tag).toBeDefined();
    });

    it('should handle parameters without values', () => {
      const url = 'https://example.com/path?flag';
      const params = getQueryParams(url);
      
      expect(params.flag).toBe('');
    });
  });

  describe('Query Parameter Manipulation', () => {
    it('should set query parameter', () => {
      const url = 'https://example.com/path';
      const newUrl = setQueryParam(url, 'key', 'value');
      
      expect(newUrl).toContain('key=value');
    });

    it('should update existing query parameter', () => {
      const url = 'https://example.com/path?key=old';
      const newUrl = setQueryParam(url, 'key', 'new');
      
      expect(newUrl).toContain('key=new');
      expect(newUrl).not.toContain('key=old');
    });

    it('should add parameter to URL with existing parameters', () => {
      const url = 'https://example.com/path?existing=value';
      const newUrl = setQueryParam(url, 'new', 'param');
      
      expect(newUrl).toContain('existing=value');
      expect(newUrl).toContain('new=param');
    });

    it('should remove query parameter', () => {
      const url = 'https://example.com/path?key1=value1&key2=value2';
      const newUrl = removeQueryParam(url, 'key1');
      
      expect(newUrl).not.toContain('key1');
      expect(newUrl).toContain('key2=value2');
    });

    it('should handle removing non-existent parameter', () => {
      const url = 'https://example.com/path?key=value';
      const newUrl = removeQueryParam(url, 'nonexistent');
      
      expect(newUrl).toBe(url);
    });

    it('should preserve hash when manipulating parameters', () => {
      const url = 'https://example.com/path?key=value#section';
      const newUrl = setQueryParam(url, 'new', 'param');
      
      expect(newUrl).toContain('#section');
    });
  });

  describe('URL Validation', () => {
    it('should validate correct HTTP URL', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should validate correct HTTPS URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('should invalidate URL without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false);
    });

    it('should invalidate malformed URL', () => {
      expect(isValidUrl('ht!tp://invalid')).toBe(false);
    });

    it('should validate URL with port', () => {
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });

    it('should validate URL with path', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
    });

    it('should validate URL with query and hash', () => {
      expect(isValidUrl('https://example.com/path?key=value#section')).toBe(true);
    });

    it('should invalidate empty string', () => {
      expect(isValidUrl('')).toBe(false);
    });

    it('should invalidate null', () => {
      expect(isValidUrl(null as any)).toBe(false);
    });

    it('should invalidate undefined', () => {
      expect(isValidUrl(undefined as any)).toBe(false);
    });
  });

  describe('URL Components Extraction', () => {
    it('should get base URL', () => {
      const base = getBaseUrl('https://example.com:8080/path?key=value#section');
      
      expect(base).toBe('https://example.com:8080');
    });

    it('should get domain', () => {
      const domain = getDomain('https://subdomain.example.com/path');
      
      expect(domain).toBe('subdomain.example.com');
    });

    it('should get path', () => {
      const path = getPath('https://example.com/path/to/page?key=value');
      
      expect(path).toBe('/path/to/page');
    });

    it('should handle URL without path', () => {
      const path = getPath('https://example.com');
      
      expect(path).toBe('/');
    });

    it('should handle URL with trailing slash', () => {
      const path = getPath('https://example.com/path/');
      
      expect(path).toBe('/path/');
    });
  });

  describe('Origin Comparison', () => {
    it('should identify same origin URLs', () => {
      const url1 = 'https://example.com/path1';
      const url2 = 'https://example.com/path2';
      
      expect(isSameOrigin(url1, url2)).toBe(true);
    });

    it('should identify different origin URLs', () => {
      const url1 = 'https://example.com/path';
      const url2 = 'https://other.com/path';
      
      expect(isSameOrigin(url1, url2)).toBe(false);
    });

    it('should consider protocol in origin comparison', () => {
      const url1 = 'https://example.com/path';
      const url2 = 'http://example.com/path';
      
      expect(isSameOrigin(url1, url2)).toBe(false);
    });

    it('should consider port in origin comparison', () => {
      const url1 = 'https://example.com:8080/path';
      const url2 = 'https://example.com:9090/path';
      
      expect(isSameOrigin(url1, url2)).toBe(false);
    });

    it('should handle subdomain differences', () => {
      const url1 = 'https://sub1.example.com/path';
      const url2 = 'https://sub2.example.com/path';
      
      expect(isSameOrigin(url1, url2)).toBe(false);
    });
  });

  describe('URL Sanitization', () => {
    it('should sanitize javascript: protocol', () => {
      const url = 'javascript:alert("xss")';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).not.toContain('javascript:');
    });

    it('should sanitize data: protocol with HTML', () => {
      const url = 'data:text/html,<script>alert("xss")</script>';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).not.toContain('data:text/html');
    });

    it('should allow safe HTTP URLs', () => {
      const url = 'https://example.com/path';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).toBe(url);
    });

    it('should allow safe HTTPS URLs', () => {
      const url = 'https://example.com/path';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).toBe(url);
    });

    it('should handle vbscript: protocol', () => {
      const url = 'vbscript:msgbox("xss")';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).not.toContain('vbscript:');
    });

    it('should sanitize URL-encoded javascript protocol', () => {
      const url = '%6A%61%76%61%73%63%72%69%70%74:alert(1)';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).not.toContain('javascript');
    });
  });

  describe('Edge Cases', () => {
    it('should handle localhost URLs', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should handle IP address URLs', () => {
      expect(isValidUrl('http://192.168.1.1:8080')).toBe(true);
    });

    it('should handle IPv6 URLs', () => {
      expect(isValidUrl('http://[::1]:8080')).toBe(true);
    });

    it('should handle file:// URLs', () => {
      const result = isValidUrl('file:///path/to/file');
      expect(typeof result).toBe('boolean');
    });

    it('should handle URLs with special characters in path', () => {
      const url = 'https://example.com/path with spaces';
      const parsed = parseUrl(url);
      expect(parsed).toBeDefined();
    });

    it('should handle URLs with unicode characters', () => {
      const url = 'https://example.com/路径';
      const parsed = parseUrl(url);
      expect(parsed).toBeDefined();
    });

    it('should handle very long URLs', () => {
      const longPath = '/path/' + 'segment/'.repeat(100);
      const url = `https://example.com${longPath}`;
      const parsed = parseUrl(url);
      expect(parsed).toBeDefined();
    });

    it('should handle URLs with many query parameters', () => {
      const params = new Array(100).fill(0).map((_, i) => `key${i}=value${i}`).join('&');
      const url = `https://example.com/path?${params}`;
      const parsed = parseUrl(url);
      expect(parsed).toBeDefined();
    });
  });
});
