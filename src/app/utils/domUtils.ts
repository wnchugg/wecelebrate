/**
 * DOM Utility Functions
 * Provides DOM manipulation and query utilities
 */

/**
 * Safely query selector
 */
export function querySelector<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): T | null {
  try {
    return parent.querySelector<T>(selector);
  } catch (error) {
    console.error(`Error querying selector "${selector}":`, error);
    return null;
  }
}

/**
 * Safely query all selectors
 */
export function querySelectorAll<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): T[] {
  try {
    return Array.from(parent.querySelectorAll<T>(selector));
  } catch (error) {
    console.error(`Error querying selector "${selector}":`, error);
    return [];
  }
}

/**
 * Get element by ID
 */
export function getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/**
 * Create element with attributes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes?: Record<string, string>,
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  if (children) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }
  
  return element;
}

/**
 * Add class to element
 */
export function addClass(element: Element, ...classNames: string[]): void {
  element.classList.add(...classNames);
}

/**
 * Remove class from element
 */
export function removeClass(element: Element, ...classNames: string[]): void {
  element.classList.remove(...classNames);
}

/**
 * Toggle class on element
 */
export function toggleClass(element: Element, className: string, force?: boolean): void {
  element.classList.toggle(className, force);
}

/**
 * Check if element has class
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * Get element position relative to viewport
 */
export function getElementPosition(element: Element): {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Get element position relative to document
 */
export function getElementOffset(element: Element): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
  };
}

/**
 * Check if element is visible in viewport
 */
export function isElementVisible(element: Element, threshold: number = 0): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  const vertInView = rect.top <= windowHeight - threshold && rect.bottom >= threshold;
  const horInView = rect.left <= windowWidth - threshold && rect.right >= threshold;
  
  return vertInView && horInView;
}

/**
 * Scroll to element
 */
export function scrollToElement(
  element: Element,
  options?: ScrollIntoViewOptions
): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    ...options,
  });
}

/**
 * Scroll to top of page
 */
export function scrollToTop(smooth: boolean = true): void {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * Get scroll position
 */
export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  };
}

/**
 * Set scroll position
 */
export function setScrollPosition(x: number, y: number, smooth: boolean = false): void {
  window.scrollTo({
    top: y,
    left: x,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/**
 * Get document dimensions
 */
export function getDocumentDimensions(): { width: number; height: number } {
  const body = document.body;
  const html = document.documentElement;
  
  return {
    width: Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth
    ),
    height: Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    ),
  };
}

/**
 * Add event listener with auto-cleanup
 */
export function addEventListener<K extends keyof WindowEventMap>(
  element: Window | Document | Element,
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void {
  element.addEventListener(event as string, handler as EventListener, options);
  
  return () => {
    element.removeEventListener(event as string, handler as EventListener, options);
  };
}

/**
 * Wait for element to appear in DOM
 */
export function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<Element | null> {
  return new Promise((resolve) => {
    const element = querySelector(selector);
    
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }
}

/**
 * Get computed style of element
 */
export function getComputedStyles(element: Element): CSSStyleDeclaration {
  return window.getComputedStyle(element);
}

/**
 * Check if element matches media query
 */
export function matchesMediaQuery(query: string): boolean {
  return window.matchMedia(query).matches;
}

/**
 * Get element's parent matching selector
 */
export function closest<T extends Element = Element>(
  element: Element,
  selector: string
): T | null {
  return element.closest<T>(selector);
}

/**
 * Get all parents of element
 */
export function getParents(element: Element): Element[] {
  const parents: Element[] = [];
  let current = element.parentElement;
  
  while (current) {
    parents.push(current);
    current = current.parentElement;
  }
  
  return parents;
}

/**
 * Check if element is child of another element
 */
export function isChildOf(child: Element, parent: Element): boolean {
  return parent.contains(child);
}

/**
 * Get siblings of element
 */
export function getSiblings(element: Element): Element[] {
  const parent = element.parentElement;
  if (!parent) return [];
  
  return Array.from(parent.children).filter(child => child !== element);
}
