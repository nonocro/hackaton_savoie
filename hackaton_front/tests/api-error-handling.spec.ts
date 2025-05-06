import { test, expect } from '@playwright/test';

test.describe('API Error Handling', () => {
  // Mock API response to simulate errors
  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API requests and mock error responses
    await page.route(`${process.env.VITE_BACKEND_URL}/departements/73/medecins`, async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    await page.goto('/carte');
    
    // Check if the application shows an error message
    // This assumes you have error handling UI that displays when the API fails
    await expect(page.getByText(/Erreur lors du chargement des données/i)).toBeVisible();
  });

  test('should handle empty data responses', async ({ page }) => {
    // Mock empty doctors response
    await page.route(`${process.env.VITE_BACKEND_URL}/departements/73/medecins`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([]), // Empty array
      });
    });
    
    await page.goto('/carte');
    
    // Check if the application handles empty data correctly
    // You might have a specific message for when no doctors are found
    await expect(page.getByText(/Aucun médecin trouvé/i)).toBeVisible();
  });
});
