import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the landing page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the title is visible
    await expect(page.locator('h1')).toContainText('Optimisez l\'implantation de centres médicaux');
    
    // Check if the navigation links are present
    await expect(page.getByText('Fonctionnalités', { exact: true })).toBeVisible();
    await expect(page.getByText('Comment ça marche', { exact: true })).toBeVisible();
    await expect(page.getByText('À propos', { exact: true })).toBeVisible();
    await expect(page.getByText('Contact', { exact: true })).toBeVisible();
    
    // Check if the CTA button is visible and clickable
    const ctaButton = page.getByRole('button', { name: /Explorer la carte/i });
    await expect(ctaButton).toBeVisible();
    
    // Check if the features section is visible
    await expect(page.locator('h2').filter({ hasText: 'Fonctionnalités principales' })).toBeVisible();
    
    // Check if all 3 feature cards are present
    const featureCards = page.locator('.flex.flex-col.items-center.space-y-2.rounded-lg.border.p-6.shadow-sm');
    await expect(featureCards).toHaveCount(3);
  });

  test('navigation to map page works', async ({ page }) => {
    await page.goto('/');
    
    // Click the CTA button
    await page.getByRole('link', { name: /Explorer la carte/i }).click();
    
    // Check that we're on the map page
    await expect(page).toHaveURL('/carte');
    
    // Verify some map page elements are visible
    // This will depend on your actual map page implementation
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });
});
