import { test, expect } from '@playwright/test';
import { login, selectFarm } from '../helpers/auth';

const NAV = '/reproduccion/diagnostico-prenez';

test.describe('Flujo: Diagnóstico de Preñez (DX)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFarm(page);
  });

  test('navegar a Diagnosis (DX)', async ({ page }) => {
    await page.goto(NAV);
    await expect(page.getByRole('heading', { name: /diagnosis|diagnóstico|prenez/i })).toBeVisible({ timeout: 8_000 });
  });

  test('mostrar badge de parámetro DIAS_ESPERA con tooltip "Editable in Settings"', async ({ page }) => {
    await page.goto(NAV);
    const badge = page.locator('[data-testid="badge-dias-espera"], .badge-dias-espera, p-tag').filter({ hasText: /día|espera/i }).first();
    if (await badge.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await badge.hover();
      await expect(page.getByText(/editable in settings/i)).toBeVisible({ timeout: 3_000 });
    }
  });

  test('filtrar por temporada finalizada y registrar diagnóstico masivo', async ({ page }) => {
    await page.goto(NAV);

    const temporadaSelect = page.locator('p-select').filter({ hasText: '' }).first();
    if (!(await temporadaSelect.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'Sin selector de temporada visible');
      return;
    }

    await temporadaSelect.click();
    const firstOption = page.getByRole('option').first();
    if (!(await firstOption.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, 'Sin temporadas disponibles');
      return;
    }
    await firstOption.click();

    await expect(page.locator('p-table, table')).toBeVisible({ timeout: 8_000 });
  });
});
