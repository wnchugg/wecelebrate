/**
 * Optimized Image Component
 * Lazy loading with Intersection Observer and blur placeholder
 * Phase 2.3: Performance Optimization
 */

import React, { useState, useEffect, useRef } from 'react';
import { logger } from '../utils/logger';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  priority?: boolean; // Load immediately, skip lazy loading
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'blur',
  blurDataURL,
  loading = 'lazy',
  onLoad,
  onError,
  objectFit = 'cover',
  priority = false
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return () => {}; // Return empty cleanup function
    }

    if (!imgRef.current) return () => {}; // Return empty cleanup function

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
    logger.log(`[OptimizedImage] Loaded: ${src}`);
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
    logger.error(`[OptimizedImage] Failed to load: ${src}`);
  };

  // Blur placeholder styles
  const placeholderStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    filter: 'blur(20px)',
    transform: 'scale(1.1)',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
    backgroundColor: '#e5e7eb',
    backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  const imageStyles: React.CSSProperties = {
    width: width || '100%',
    height: height || '100%',
    objectFit,
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out'
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: width || '100%',
    height: height || '100%',
    overflow: 'hidden'
  };

  // Error state
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={containerStyles}
      >
        <div className="text-center text-gray-500 p-4">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={containerStyles}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div style={placeholderStyles} aria-hidden="true" />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        style={imageStyles}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        decoding="async"
      />

      {/* Loading spinner overlay */}
      {!isLoaded && isInView && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          aria-label="Loading image"
        >
          <div className="w-8 h-8 border-3 border-[#D91C81] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * Optimized Background Image Component
 */
interface OptimizedBackgroundImageProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
  priority?: boolean;
}

export function OptimizedBackgroundImage({
  src,
  className = '',
  children,
  overlay = false,
  overlayOpacity = 0.5,
  priority = false
}: OptimizedBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return () => {}; // Return empty cleanup function
    }

    if (!containerRef.current) return () => {}; // Return empty cleanup function

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px', threshold: 0.01 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => logger.error(`[OptimizedBackgroundImage] Failed to load: ${src}`);
  }, [src, isInView]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: isLoaded ? 'transparent' : '#e5e7eb'
      }}
    >
      {/* Overlay */}
      {overlay && isLoaded && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}

      {/* Loading state */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-3 border-[#D91C81] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Progressive Image Component (loads low-res first, then high-res)
 */
interface ProgressiveImageProps {
  lowResSrc: string;
  highResSrc: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function ProgressiveImage({
  lowResSrc,
  highResSrc,
  alt,
  width,
  height,
  className = '',
  objectFit = 'cover'
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(lowResSrc);
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = highResSrc;
    img.onload = () => {
      setCurrentSrc(highResSrc);
      setIsHighResLoaded(true);
    };
  }, [highResSrc]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${isHighResLoaded ? '' : 'blur-sm'}`}
      style={{
        width: width || '100%',
        height: height || '100%',
        objectFit,
        transition: 'filter 0.3s ease-in-out'
      }}
      loading="lazy"
      decoding="async"
    />
  );
}