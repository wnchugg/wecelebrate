import { formatCurrency, convertCurrency } from '../utils/countries';
import { useSite, getSiteCurrency } from '../hooks/useSite';

export interface CurrencyDisplayProps {
  amount: number;
  baseCurrency?: string;
  className?: string;
  siteId?: string; // Optional: override site detection
}

export function CurrencyDisplay({ 
  amount, 
  baseCurrency = 'USD', 
  className = '',
  siteId
}: CurrencyDisplayProps) {
  // Get target currency from site configuration
  const { site } = useSite(siteId);
  const targetCurrency = getSiteCurrency(site);
  
  // Convert amount if currencies differ
  const convertedAmount = baseCurrency !== targetCurrency
    ? convertCurrency(amount, baseCurrency, targetCurrency)
    : amount;
  
  // Format with appropriate currency symbol
  const formattedAmount = formatCurrency(convertedAmount, targetCurrency);
  
  return <span className={className}>{formattedAmount}</span>;
}

// Hook for currency conversion in components
export function useCurrency(siteId?: string) {
  const { site } = useSite(siteId);
  const currency = getSiteCurrency(site);
  
  const convert = (amount: number, fromCurrency: string = 'USD'): number => {
    return fromCurrency !== currency
      ? convertCurrency(amount, fromCurrency, currency)
      : amount;
  };
  
  const format = (amount: number, fromCurrency: string = 'USD'): string => {
    const convertedAmount = convert(amount, fromCurrency);
    return formatCurrency(convertedAmount, currency);
  };
  
  return {
    currency,
    convert,
    format,
  };
}