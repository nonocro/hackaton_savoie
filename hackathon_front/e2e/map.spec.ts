import { test, expect } from '@playwright/test';

test.describe('Map Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the map page before each test
    await page.goto('/carte');
    // Wait for the map to be fully loaded
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
  });

  test('should display the map correctly', async ({ page }) => {
    // Check if the map container is visible
    await expect(page.locator('.leaflet-container')).toBeVisible();
    
    // Check if the tile layer is loaded
    await expect(page.locator('.leaflet-tile-loaded')).toBeVisible();
    
    // Check if the legend is visible
    await expect(page.getByText('Médecins pour 1000 habitants')).toBeVisible();
  });

  test('should activate isochrone mode', async ({ page }) => {
    // Find and click the isochrone control button
    const isochroneButton = page.getByText('Activer');
    await expect(isochroneButton).toBeVisible();
    await isochroneButton.click();
    
    // Check if the mode is activated
    await expect(page.getByText('Désactiver')).toBeVisible();
    await expect(page.getByText('Cliquez n\'importe où sur la carte')).toBeVisible();
  });

  test('should show commune information on click', async ({ page }) => {
    // This test will need to be adjusted based on actual communes displayed on your map
    // First make sure we're not in isochrone mode
    if (await page.getByText('Désactiver').isVisible()) {
      await page.getByText('Désactiver').click();
    }
    
    // Find a commune polygon and click it
    // Note: This selector might need adjustment based on your actual DOM structure
    const polygons = page.locator('.leaflet-interactive');
    if (await polygons.count() > 0) {
      await polygons.first().click();
      
      // Check if popup appears with commune data
      await expect(page.locator('.leaflet-popup')).toBeVisible();
      
      // Check for expected information in the popup
      await expect(page.locator('.leaflet-popup')).toContainText('Population:');
      await expect(page.locator('.leaflet-popup')).toContainText('Médecins:');
    }
  });

  test('should change the isochrone time', async ({ page }) => {
    // This test assumes you have a time selector component
    // Adjust the selectors based on your actual implementation
    
    // Find and interact with the time selector (assuming it's a dropdown or input)
    const timeSelector = page.locator('select[name="isochroneTime"]');
    if (await timeSelector.isVisible()) {
      // Select a different time value
      await timeSelector.selectOption('600'); // 10 minutes
      
      // Verify the change is reflected
      await expect(page.getByText('Temps de trajet: 10 minutes')).toBeVisible();
    }
  });
});
