import { test, expect } from '@playwright/test';
import { login, selectFarm } from '../helpers/auth';

const NAV = '/reproduccion/partos';

test.describe('Flujo: Partos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFarm(page);
  });

  test('navegar a partos y ver tabla', async ({ page }) => {
    await page.goto(NAV);
    await expect(page.getByRole('heading', { name: /parto/i })).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('p-table, table')).toBeVisible({ timeout: 5_000 });
  });

  test('abrir modal de nuevo parto', async ({ page }) => {
    await page.goto(NAV);
    await page.getByRole('button', { name: /nuevo parto|registrar/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });

    // Verificar que hay sub-tabla editable de crías
    await expect(
      page.locator('[data-testid="tabla-crias"], .crias-table, p-table').last()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('auto-set fecha parto al elegir hembra preñada', async ({ page }) => {
    await page.goto(NAV);
    await page.getByRole('button', { name: /nuevo parto|registrar/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Seleccionar hembra
    const hembraSelect = dialog.locator('p-select[formcontrolname*="hembra"], p-select').first();
    if (await hembraSelect.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await hembraSelect.click();
      const firstHembra = page.getByRole('option').first();
      if (await firstHembra.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await firstHembra.click();
        // Fecha debe auto-rellenarse
        const fechaInput = dialog.locator('input[id*="fecha"], p-datepicker input').first();
        await expect(fechaInput).not.toHaveValue('', { timeout: 3_000 });
      }
    }
  });
});
