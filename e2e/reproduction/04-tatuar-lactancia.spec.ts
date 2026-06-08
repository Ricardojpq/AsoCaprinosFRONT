import { test, expect } from '@playwright/test';
import { login, selectFarm } from '../helpers/auth';

test.describe('Flujo: Tatuar Crías', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFarm(page);
  });

  test('navegar a tatuar crías', async ({ page }) => {
    await page.goto('/reproduccion/tatuar-crias');
    await expect(page.getByRole('heading', { name: /tatuar|crías/i })).toBeVisible({ timeout: 8_000 });
  });

  test('mostrar crías pendientes de tatuar', async ({ page }) => {
    await page.goto('/reproduccion/tatuar-crias');
    await expect(page.locator('p-table, table')).toBeVisible({ timeout: 8_000 });
  });

  test('abrir modal tatuar y ver cod_animal sugerido', async ({ page }) => {
    await page.goto('/reproduccion/tatuar-crias');

    const botonTatuar = page.getByRole('button', { name: /tatuar/i }).first();
    if (!(await botonTatuar.isVisible({ timeout: 6_000 }).catch(() => false))) {
      test.skip(true, 'No hay crías para tatuar');
      return;
    }
    await botonTatuar.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // cod_animal debe estar pre-rellenado
    const codAnimalInput = dialog.locator('input[formcontrolname="cod_animal"], input[id="cod_animal"]').first();
    await expect(codAnimalInput).not.toHaveValue('', { timeout: 5_000 });
  });
});

test.describe('Flujo: Lactancia', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFarm(page);
  });

  test('navegar a lactancia', async ({ page }) => {
    await page.goto('/reproduccion/lactancia');
    await expect(page.getByRole('heading', { name: /lactancia/i })).toBeVisible({ timeout: 8_000 });
  });

  test('ver controles de lactancia en tabla', async ({ page }) => {
    await page.goto('/reproduccion/lactancia');
    await expect(page.locator('p-table, table')).toBeVisible({ timeout: 8_000 });
  });
});
