// Playwright smoke test for Design Mode flows.
// This project does not currently include a Playwright runner config in-repo,
// so this spec is provided as the canonical E2E test contract.

import { test, expect } from '@playwright/test';

test('design mode live edit + save persists user_template_id', async ({ page }) => {
  await page.goto('/customize');

  await expect(page.getByRole('button', { name: /design mode/i })).toBeVisible();
  await page.getByRole('button', { name: /design mode/i }).click();

  // Select a text node via overlay-backed DOM markers.
  await page.locator('[data-edit-path="content.summary"]').first().click();
  await page.getByLabel('Text').fill('Updated summary from E2E test');

  // Save and validate success toast.
  await page.getByRole('button', { name: /^save$/i }).click();
  await expect(page.getByText(/saved/i)).toBeVisible();

  // Optional contract assertion for linkage in local workflow state.
  const currentUserTemplateId = await page.evaluate(() => localStorage.getItem('currentUserTemplateId'));
  expect(currentUserTemplateId).toBeTruthy();
});
