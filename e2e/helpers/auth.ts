import { Page } from '@playwright/test';

export const TEST_USER = {
  email: process.env['E2E_USER'] || 'admin@asocaprinos.com',
  password: process.env['E2E_PASS'] || 'password',
};

export async function login(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel(/correo|email/i).fill(TEST_USER.email);
  await page.getByLabel(/contraseña|password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
  await page.waitForURL(/dashboard|reproduccion/, { timeout: 10_000 });
}

export async function selectFarm(page: Page, farmName?: string): Promise<void> {
  const selector = page.locator('[data-testid="farm-selector"], p-select[formcontrolname="finca"]').first();
  if (await selector.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await selector.click();
    const option = farmName
      ? page.getByRole('option', { name: farmName })
      : page.getByRole('option').first();
    await option.click();
  }
}
