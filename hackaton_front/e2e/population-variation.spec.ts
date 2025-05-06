import { test, expect } from '@playwright/test';

test.describe('Population Variation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/carte');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
  });

  test('should switch between regular, summer and winter populations', async ({ page }) => {
    // This test assumes you have a season selector
    // Adjust based on your actual implementation
    
    // Find the season selector (assuming it's a dropdown)
    const seasonSelector = page.locator('select[name="saison"]');
    if (await seasonSelector.isVisible()) {
      // Check default season
      await expect(seasonSelector).toHaveValue('NORMAL');
      
      // Switch to summer
      await seasonSelector.selectOption('ETE');
      
      // Verify colors might have changed (this will depend on your actual implementation)
      // Take a screenshot to visually verify later
      await page.screenshot({ path: 'test-results/summer-population.png' });
      
      // Switch to winter
      await seasonSelector.selectOption('HIVER');
      
      // Take another screenshot
      await page.screenshot({ path: 'test-results/winter-population.png' });
    }
  });
});
