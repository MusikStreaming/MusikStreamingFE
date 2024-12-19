import { test, expect } from '@playwright/test';

const keywords = [
  'lover',
  'love',
  'atlas',
  'daddy'
]

for (const keyword of keywords) {
  test(`search for "${keyword}"`, async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByText('exploreKhám phá0').click();
    await page.getByRole('textbox', { name: 'Search' }).click();
    await page.getByRole('textbox', { name: 'Search' }).fill(keyword);
    await page.goto(`http://localhost:3000/search?q=${keyword}`);
    await expect(await page.locator(`text=Search results for "${keyword}"` || 'No results found')).toBeVisible();
  });
}