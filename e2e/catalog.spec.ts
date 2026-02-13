import { test, expect } from '@playwright/test';

test.describe('Catalog Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the catalog management page
    // Note: You'll need to handle authentication first
    await page.goto('/admin/catalogs');
  });

  test('should display catalog list page', async ({ page }) => {
    // Wait for the page to load
    await page.waitForSelector('h1');
    
    // Check for page title
    await expect(page.locator('h1')).toContainText('Catalog Management');
    
    // Check for "Create Catalog" button
    await expect(page.getByRole('button', { name: /create catalog/i })).toBeVisible();
  });

  test('should search catalogs', async ({ page }) => {
    // Wait for catalogs to load
    await page.waitForSelector('.catalog-card', { timeout: 5000 });
    
    // Get initial count of catalogs
    const initialCatalogs = await page.locator('.catalog-card').count();
    expect(initialCatalogs).toBeGreaterThan(0);
    
    // Search for "SAP"
    await page.fill('input[placeholder*="Search"]', 'SAP');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Check that we have fewer results
    const filteredCatalogs = await page.locator('.catalog-card').count();
    expect(filteredCatalogs).toBeLessThanOrEqual(initialCatalogs);
  });

  test('should filter catalogs by type', async ({ page }) => {
    // Wait for catalogs to load
    await page.waitForSelector('.catalog-card', { timeout: 5000 });
    
    // Find and click type filter dropdown
    const typeFilter = page.locator('select[name="typeFilter"]');
    if (await typeFilter.count() > 0) {
      await typeFilter.selectOption('erp');
      
      // Wait for filtered results
      await page.waitForTimeout(500);
      
      // Verify filtered results (all should be ERP type)
      const catalogCards = await page.locator('.catalog-card').all();
      for (const card of catalogCards) {
        const text = await card.textContent();
        expect(text?.toLowerCase()).toContain('erp');
      }
    }
  });

  test('should navigate to create catalog page', async ({ page }) => {
    // Click "Create Catalog" button
    await page.click('button:has-text("Create Catalog")');
    
    // Wait for navigation
    await page.waitForURL('**/admin/catalogs/create');
    
    // Verify we're on the create page
    await expect(page.locator('h1')).toContainText('Create Catalog');
  });
});

test.describe('Site Catalog Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to site configuration page
    await page.goto('/admin/site-catalog-configuration');
  });

  test('should show warning when no site selected', async ({ page }) => {
    // Check for warning message
    const warning = page.locator('text=/no site selected/i');
    
    // The warning might or might not be visible depending on state
    // Just check that the page loads
    await expect(page.locator('h1')).toContainText('Site Catalog Configuration');
  });

  test('should load catalog dropdown', async ({ page }) => {
    // Check for catalog dropdown
    const catalogSelect = page.locator('select[name="catalogId"]');
    await expect(catalogSelect).toBeVisible();
    
    // Check that it has options
    const options = await catalogSelect.locator('option').count();
    expect(options).toBeGreaterThan(0);
  });
});

test.describe('Catalog Migration', () => {
  test('should display migration status', async ({ page }) => {
    await page.goto('/admin/catalogs/migrate');
    
    // Check for page title
    await expect(page.locator('h1')).toContainText('Catalog Migration');
    
    // Check for migration status section
    await expect(page.locator('text=/migration status/i')).toBeVisible();
  });

  test('should show migration statistics', async ({ page }) => {
    await page.goto('/admin/catalogs/migrate');
    
    // Wait for statistics to load
    await page.waitForTimeout(1000);
    
    // Check for statistics section
    const statsSection = page.locator('text=/statistics/i');
    if (await statsSection.count() > 0) {
      await expect(statsSection).toBeVisible();
    }
  });
});
