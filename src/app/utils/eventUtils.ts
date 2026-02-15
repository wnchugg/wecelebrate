/**
 * Event Utility Functions
 * Provides event handling and emitter utilities
 */

/**
 * Simple event emitter
 */
export class EventEmitter<T extends Record<string, any> = Record<string, any>> {
  private events: Map<keyof T, Set<Function>> = new Map();
  
  /**
   * Subscribe to an event
   */
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event).add(handler);
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }
  
  /**
   * Subscribe to an event once
   */
  once<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void {
    const wrappedHandler = (data: T[K]) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    
    return this.on(event, wrappedHandler);
  }
  
  /**
   * Unsubscribe from an event
   */
  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
  
  /**
   * Emit an event
   */
  emit<K extends keyof T>(event: K, data: T[K]): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
  
  /**
   * Remove all listeners for an event
   */
  removeAllListeners<K extends keyof T>(event?: K): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
  
  /**
   * Get listener count for an event
   */
  listenerCount<K extends keyof T>(event: K): number {
    return this.events.get(event)?.size || 0;
  }
}

/**
 * Create a custom event
 */
export function createCustomEvent<T = any>(
  name: string,
  detail?: T,
  options?: EventInit
): CustomEvent<T> {
  return new CustomEvent(name, {
    detail,
    bubbles: true,
    cancelable: true,
    ...options,
  });
}

/**
 * Dispatch a custom event
 */
export function dispatchCustomEvent<T = any>(
  element: Element | Document | Window,
  name: string,
  detail?: T,
  options?: EventInit
): boolean {
  const event = createCustomEvent(name, detail, options);
  return element.dispatchEvent(event);
}

/**
 * Prevent default and stop propagation
 */
export function stopEvent(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Check if event target matches selector
 */
export function eventMatches(event: Event, selector: string): boolean {
  const target = event.target as Element;
  return target?.matches?.(selector) || false;
}

/**
 * Get event target that matches selector (event delegation)
 */
export function getEventTarget(event: Event, selector: string): Element | null {
  const target = event.target as Element;
  return target?.closest?.(selector) || null;
}

/**
 * Add event listener with delegation
 */
export function delegateEvent<K extends keyof HTMLElementEventMap>(
  element: Element | Document,
  eventType: K,
  selector: string,
  handler: (event: HTMLElementEventMap[K], target: Element) => void
): () => void {
  const wrappedHandler = (event: Event) => {
    const target = getEventTarget(event, selector);
    if (target) {
      handler(event as HTMLElementEventMap[K], target);
    }
  };
  
  element.addEventListener(eventType, wrappedHandler as EventListener);
  
  return () => {
    element.removeEventListener(eventType, wrappedHandler as EventListener);
  };
}

/**
 * Keyboard event utilities
 */
export const keyboard = {
  isEnter: (event: KeyboardEvent) => event.key === 'Enter',
  isEscape: (event: KeyboardEvent) => event.key === 'Escape',
  isSpace: (event: KeyboardEvent) => event.key === ' ',
  isArrowUp: (event: KeyboardEvent) => event.key === 'ArrowUp',
  isArrowDown: (event: KeyboardEvent) => event.key === 'ArrowDown',
  isArrowLeft: (event: KeyboardEvent) => event.key === 'ArrowLeft',
  isArrowRight: (event: KeyboardEvent) => event.key === 'ArrowRight',
  isTab: (event: KeyboardEvent) => event.key === 'Tab',
  isShift: (event: KeyboardEvent) => event.shiftKey,
  isCtrl: (event: KeyboardEvent) => event.ctrlKey,
  isAlt: (event: KeyboardEvent) => event.altKey,
  isMeta: (event: KeyboardEvent) => event.metaKey,
  
  /**
   * Check if modifier key is pressed
   */
  hasModifier: (event: KeyboardEvent) => 
    event.ctrlKey || event.metaKey || event.altKey || event.shiftKey,
  
  /**
   * Check if Cmd (Mac) or Ctrl (Windows) is pressed
   */
  isCmdOrCtrl: (event: KeyboardEvent) => 
    event.metaKey || event.ctrlKey,
};

/**
 * Mouse event utilities
 */
export const mouse = {
  isLeftClick: (event: MouseEvent) => event.button === 0,
  isRightClick: (event: MouseEvent) => event.button === 2,
  isMiddleClick: (event: MouseEvent) => event.button === 1,
  
  /**
   * Get mouse position relative to element
   */
  getRelativePosition: (event: MouseEvent, element: Element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  },
  
  /**
   * Get mouse position in viewport
   */
  getViewportPosition: (event: MouseEvent) => ({
    x: event.clientX,
    y: event.clientY,
  }),
  
  /**
   * Get mouse position in page (including scroll)
   */
  getPagePosition: (event: MouseEvent) => ({
    x: event.pageX,
    y: event.pageY,
  }),
};

/**
 * Touch event utilities
 */
export const touch = {
  /**
   * Get first touch position
   */
  getPosition: (event: TouchEvent) => {
    const touch = event.touches[0] || event.changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  },
  
  /**
   * Get all touch positions
   */
  getAllPositions: (event: TouchEvent) => 
    Array.from(event.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
    })),
  
  /**
   * Check if multi-touch
   */
  isMultiTouch: (event: TouchEvent) => event.touches.length > 1,
};

/**
 * Create a one-time event listener
 */
export function onceEvent<K extends keyof WindowEventMap>(
  element: Element | Window | Document,
  eventType: K,
  handler: (event: WindowEventMap[K]) => void
): void {
  const wrappedHandler = (event: Event) => {
    handler(event as WindowEventMap[K]);
    element.removeEventListener(eventType, wrappedHandler as EventListener);
  };
  
  element.addEventListener(eventType, wrappedHandler as EventListener);
}

/**
 * Wait for an event to occur
 */
export function waitForEvent<K extends keyof WindowEventMap>(
  element: Element | Window | Document,
  eventType: K,
  timeout?: number
): Promise<WindowEventMap[K]> {
  return new Promise((resolve, reject) => {
    const handler = (event: Event) => {
      if (timeoutId) clearTimeout(timeoutId);
      element.removeEventListener(eventType, handler as EventListener);
      resolve(event as WindowEventMap[K]);
    };
    
    element.addEventListener(eventType, handler as EventListener);
    
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (timeout) {
      timeoutId = setTimeout(() => {
        element.removeEventListener(eventType, handler as EventListener);
        reject(new Error(`Event ${String(eventType)} timeout`));
      }, timeout);
    }
  });
}

/**
 * Passive event listener (for better scroll performance)
 */
export function addPassiveListener<K extends keyof WindowEventMap>(
  element: Element | Window | Document,
  eventType: K,
  handler: (event: WindowEventMap[K]) => void
): () => void {
  element.addEventListener(eventType, handler as EventListener, { passive: true });
  
  return () => {
    element.removeEventListener(eventType, handler as EventListener);
  };
}
