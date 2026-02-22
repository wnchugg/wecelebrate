/**
 * CatalogInitializer
 * This component automatically initializes the gift catalog if it hasn't been set up yet.
 */

import { useEffect, useState } from 'react';
import { ensureCatalogInitialized } from '../lib/apiClient';
import { logger } from '../utils/logger';

export function CatalogInitializer(): null {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setIsInitializing(true);
      try {
        await ensureCatalogInitialized();
        setInitError(null);
      } catch (error: unknown) {
        logger.error('Catalog initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsInitializing(false);
      }
    };

    void initialize();
  }, []);

  // This component doesn't render anything visible
  return null;
}