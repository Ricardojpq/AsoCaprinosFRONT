import { test, expect } from '@playwright/test';
import { login, selectFarm } from '../helpers/auth';

test.describe('Dashboard Reproductivo (P2-03)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFarm(page);
  });

  test('muestra KPIs de temporadas', async ({ page }) => {
    await page.goto('/reproduccion/dashboard');
    await expect(page.getByText(/temporadas/i)).toBeVisible({ timeout: 10_000 });
  });

  test('muestra tasa de preñez como porcentaje', async ({ page }) => {
    await page.goto('/reproduccion/dashboard');
    await expect(page.getByText(/tasa de preñez/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=/%/')).toBeVisible({ timeout: 5_000 });
  });

  test('muestra próximos eventos si los hay', async ({ page }) => {
    await page.goto('/reproduccion/dashboard');
    await page.waitForTimeout(2_000);
    const seccionEventos = page.locator('text=Próximos Eventos');
    if (await seccionEventos.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(page.locator('p-tag').first()).toBeVisible({ timeout: 3_000 });
    }
  });

  test('KPIs de crías muestran totales', async ({ page }) => {
    await page.goto('/reproduccion/dashboard');
    await expect(page.getByText(/crías/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/sin tatuar|tatuadas/i)).toBeVisible({ timeout: 5_000 });
  });
});
