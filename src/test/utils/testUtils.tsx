import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router';

/**
 * Custom render function that wraps components with necessary providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const AllTheProviders = ({ children }: { children: ReactNode }) => {
    return <BrowserRouter>{children}</BrowserRouter>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Wait for async operations to complete
 */
export async function waitForLoadingToFinish() {
  const { waitForElementToBeRemoved, screen } = await import('@testing-library/react');
  
  try {
    await waitForElementToBeRemoved(() => screen.queryByTestId('loading-spinner'), {
      timeout: 3000,
    });
  } catch {
    // Loading spinner might not be present
  }
}

/**
 * Mock SiteContext provider
 */
export function createMockSiteContext(currentSite: any = null) {
  return {
    currentSite,
    setCurrentSite: () => {},
    sites: [] as any[],
    loading: false,
  };
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };