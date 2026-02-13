/**
 * useCopyToClipboard Hook
 * Copy text to clipboard with state management
 */

import { useState, useCallback } from 'react';

export interface UseCopyToClipboardReturn {
  copiedText: string | null;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
  isCopied: boolean;
}

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setIsCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      setCopiedText(null);
      setIsCopied(false);
      return false;
    }
  }, []);
  
  const reset = useCallback(() => {
    setCopiedText(null);
    setIsCopied(false);
  }, []);
  
  return { copiedText, copy, reset, isCopied };
}
