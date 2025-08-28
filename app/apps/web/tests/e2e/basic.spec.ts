import { test, expect } from '@playwright/test';

test('map page loads and shows controls', async ({ page }) => {
  await page.goto('/map');
  await expect(page.getByText('Interactive Map')).toBeVisible();
  await expect(page.getByLabel('H3 Res')).toBeVisible();
});

