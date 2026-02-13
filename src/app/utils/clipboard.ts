/**
 * Selects text in a DOM element
 * @param elementId - The ID of the element containing the text to select
 * @returns boolean indicating if selection was successful
 */
export function selectTextInElement(elementId: string): boolean {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with ID '${elementId}' not found`);
      return false;
    }

    const range = document.createRange();
    range.selectNodeContents(element);
    
    const selection = window.getSelection();
    if (!selection) {
      return false;
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  } catch (error) {
    console.error('Failed to select text:', error);
    return false;
  }
}

export interface ClipboardResult {
  success: boolean;
  method: 'clipboard-api' | 'execCommand' | 'manual';
  error?: string;
}

/**
 * Copy text to clipboard using modern Clipboard API with fallback
 * @param text - The text to copy to clipboard
 * @returns Promise with result information
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard-api' };
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback:', error);
    }
  }

  // Fallback to execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return { success: true, method: 'execCommand' };
    } else {
      return {
        success: false,
        method: 'manual',
        error: 'execCommand failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      method: 'manual',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Alias for copyToClipboard - for backward compatibility
 */
export const copyTextToClipboard = copyToClipboard;