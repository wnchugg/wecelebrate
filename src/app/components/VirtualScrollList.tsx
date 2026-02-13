/**
 * Virtual Scrolling Component
 * Efficiently renders large lists by only rendering visible items
 * Phase 2.3: Performance Optimization
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '../utils/logger';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Number of items to render outside viewport
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number; // Pixels from bottom to trigger
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  keyExtractor,
  className = '',
  emptyMessage = 'No items to display',
  loadingMessage = 'Loading...',
  isLoading = false,
  onEndReached,
  onEndReachedThreshold = 200
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

  // Add overscan
  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length, visibleEnd + overscan);

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex);

  // Calculate offset for absolute positioning
  const offsetY = startIndex * itemHeight;

  // Total height of all items
  const totalHeight = items.length * itemHeight;

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);

    // Check if we're near the bottom
    if (onEndReached) {
      const scrolledToBottom = 
        target.scrollHeight - target.scrollTop - target.clientHeight;
      
      if (scrolledToBottom < onEndReachedThreshold && !isLoading) {
        onEndReached();
      }
    }
  }, [onEndReached, onEndReachedThreshold, isLoading]);

  // Log performance metrics in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      logger.log(`[VirtualScroll] Rendering ${visibleItems.length}/${items.length} items`);
    }
  }, [visibleItems.length, items.length]);

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <div className="text-center text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Spacer to maintain total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const key = keyExtractor(item, actualIndex);
            
            return (
              <div
                key={key}
                style={{ height: itemHeight }}
                className="virtual-scroll-item"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-[#D91C81] border-t-transparent rounded-full animate-spin" />
            <span>{loadingMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook for virtual scrolling state management
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 3
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length, visibleEnd + overscan);

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    scrollTop,
    setScrollTop
  };
}

/**
 * Virtual Grid Component (for grid layouts)
 */
interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number;
  itemWidth: number;
  columns: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  gap?: number;
}

export function VirtualGrid<T>({
  items,
  itemHeight,
  itemWidth,
  columns,
  containerHeight,
  renderItem,
  overscan = 2,
  keyExtractor,
  className = '',
  gap = 16
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate rows
  const totalRows = Math.ceil(items.length / columns);
  const rowHeight = itemHeight + gap;

  // Calculate visible rows
  const visibleStart = Math.floor(scrollTop / rowHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / rowHeight);

  const startRow = Math.max(0, visibleStart - overscan);
  const endRow = Math.min(totalRows, visibleEnd + overscan);

  // Get visible items
  const startIndex = startRow * columns;
  const endIndex = Math.min(items.length, endRow * columns);
  const visibleItems = items.slice(startIndex, endIndex);

  const offsetY = startRow * rowHeight;
  const totalHeight = totalRows * rowHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  };

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, ${itemWidth}px)`,
            gap: `${gap}px`
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const key = keyExtractor(item, actualIndex);
            
            return (
              <div key={key} style={{ height: itemHeight }}>
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}