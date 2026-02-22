import { useSite } from '../context/SiteContext';

type UnitSystem = 'metric' | 'imperial';

interface UnitsResult {
  formatWeight: (grams: number) => string;
  formatLength: (cm: number) => string;
  system: UnitSystem;
}

/**
 * Hook for formatting measurements with locale-appropriate units
 * Converts between metric and imperial systems based on country
 */
export function useUnits(): UnitsResult {
  const { currentSite } = useSite();
  const country = currentSite?.settings?.defaultCountry || 'US';
  const system = getUnitSystem(country);
  
  const formatWeight = (grams: number): string => {
    if (system === 'imperial') {
      const pounds = grams / 453.592;
      return `${pounds.toFixed(2)} lbs`;
    }
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(2)} kg`;
    }
    return `${grams} g`;
  };
  
  const formatLength = (cm: number): string => {
    if (system === 'imperial') {
      const inches = cm / 2.54;
      return `${inches.toFixed(1)} in`;
    }
    return `${cm} cm`;
  };
  
  return { formatWeight, formatLength, system };
}

/**
 * Determines the unit system based on country code
 * @param country ISO country code
 * @returns 'imperial' for US, Liberia, Myanmar; 'metric' for all others
 */
export function getUnitSystem(country: string): UnitSystem {
  // Countries using imperial system
  const imperialCountries = ['US', 'LR', 'MM']; // USA, Liberia, Myanmar
  return imperialCountries.includes(country) ? 'imperial' : 'metric';
}
