import { Link, LinkProps } from 'react-router';
import { MouseEvent, useRef } from 'react';
import { preloadRoute } from '../utils/routePreloader';

interface PrefetchLinkProps extends LinkProps {
  prefetchFn?: () => Promise<unknown>;
}

/**
 * Enhanced Link component that preloads route components on hover
 * This significantly improves perceived performance by loading code before navigation
 */
export function PrefetchLink({ prefetchFn, onMouseEnter, ...props }: PrefetchLinkProps) {
  const hasPreloadedRef = useRef(false);

  const handleMouseEnter = async (e: MouseEvent<HTMLAnchorElement>) => {
    // Call original onMouseEnter if provided
    if (onMouseEnter) {
      onMouseEnter(e);
    }

    // Preload the route if a prefetch function is provided and hasn't been preloaded yet
    if (prefetchFn && !hasPreloadedRef.current) {
      hasPreloadedRef.current = true;
      await preloadRoute(prefetchFn);
    }
  };

  return <Link {...props} onMouseEnter={() => void handleMouseEnter()} />;
}