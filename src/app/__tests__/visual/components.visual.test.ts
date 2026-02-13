/**
 * Visual Regression Tests for UI Components
 * Tests visual appearance and catches unintended UI changes
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression - Components', () => {
  test('button component variants', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('product card appearance', async ({ page }) => {
    await page.goto('/products');
    
    await page.waitForLoadState('networkidle');
    
    // Screenshot of product grid
    const productGrid = page.locator('[data-testid="product-grid"]');
    if (await productGrid.isVisible()) {
      await expect(productGrid).toHaveScreenshot('product-grid.png');
    }
  });

  test('cart modal appearance', async ({ page }) => {
    await page.goto('/cart');
    
    await page.waitForLoadState('networkidle');
    
    // Screenshot of cart
    await expect(page).toHaveScreenshot('cart-page.png', {
      fullPage: true,
    });
  });

  test('checkout form appearance', async ({ page }) => {
    await page.goto('/checkout');
    
    await page.waitForLoadState('networkidle');
    
    // Screenshot of checkout form
    await expect(page).toHaveScreenshot('checkout-form.png', {
      fullPage: true,
    });
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  test('mobile homepage', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
    });
  });

  test('tablet homepage', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
    });
  });

  test('desktop homepage', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
    });
  });
});

test.describe('Visual Regression - Dark Mode', () => {
  test('dark mode appearance', async ({ page }) => {
    await page.goto('/');
    
    // Toggle dark mode if available
    const darkModeToggle = page.locator('[data-testid="theme-toggle"]');
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition
    }
    
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
    });
  });
});

test.describe('Visual Regression - Component States', () => {
  test('button hover states', async ({ page }) => {
    await page.goto('/');
    
    const button = page.locator('button').first();
    
    // Normal state
    await expect(button).toHaveScreenshot('button-normal.png');
    
    // Hover state
    await button.hover();
    await expect(button).toHaveScreenshot('button-hover.png');
    
    // Focus state
    await button.focus();
    await expect(button).toHaveScreenshot('button-focus.png');
  });

  test('form input states', async ({ page }) => {
    await page.goto('/checkout');
    
    const input = page.locator('input[type="text"]').first();
    
    if (await input.isVisible()) {
      // Empty state
      await expect(input).toHaveScreenshot('input-empty.png');
      
      // Filled state
      await input.fill('Test Value');
      await expect(input).toHaveScreenshot('input-filled.png');
      
      // Focus state
      await input.focus();
      await expect(input).toHaveScreenshot('input-focus.png');
    }
  });
});

test.describe('Visual Regression - Admin Interface', () => {
  test('admin dashboard layout', async ({ page }) => {
    await page.goto('/admin/login');
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('admin-login.png', {
      fullPage: true,
    });
  });

  test('admin clients page', async ({ page }) => {
    // Note: This would require authentication in real tests
    await page.goto('/admin/clients');
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('admin-clients.png', {
      fullPage: true,
    });
  });
});

test.describe('Visual Regression - Multi-Language', () => {
  test('spanish language appearance', async ({ page }) => {
    await page.goto('/');
    
    // Switch to Spanish if language selector is available
    const langSelector = page.locator('[data-testid="language-selector"]');
    if (await langSelector.isVisible()) {
      await langSelector.click();
      await page.locator('text=Español').click();
      await page.waitForTimeout(500);
    }
    
    await expect(page).toHaveScreenshot('homepage-spanish.png', {
      fullPage: true,
    });
  });

  test('french language appearance', async ({ page }) => {
    await page.goto('/');
    
    const langSelector = page.locator('[data-testid="language-selector"]');
    if (await langSelector.isVisible()) {
      await langSelector.click();
      await page.locator('text=Français').click();
      await page.waitForTimeout(500);
    }
    
    await expect(page).toHaveScreenshot('homepage-french.png', {
      fullPage: true,
    });
  });
});

test.describe('Visual Regression - Error States', () => {
  test('404 page appearance', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('404-page.png', {
      fullPage: true,
    });
  });

  test('error message appearance', async ({ page }) => {
    await page.goto('/checkout');
    
    // Try to submit empty form to trigger errors
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('form-errors.png', {
        fullPage: true,
      });
    }
  });
});
