import { test, expect } from '@playwright/test';
import { login, selectFarm } from '../helpers/auth';

const NAV = '/animales';

test.describe('Filtros avanzados de animales (P2-04)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFarm(page);
    await page.goto(NAV);
    await expect(page.locator('p-table, table')).toBeVisible({ timeout: 8_000 });
  });

  test('panel de filtros avanzados se expande', async ({ page }) => {
    const toggleBtn = page.locator('p-panel').filter({ hasText: /filtros avanzados/i }).first();
    await expect(toggleBtn).toBeVisible({ timeout: 5_000 });
    // Expandir
    await toggleBtn.locator('button').first().click();
    await expect(page.locator('p-select').filter({ hasText: '' }).first()).toBeVisible({ timeout: 3_000 });
  });

  test('filtrar por sexo Hembra', async ({ page }) => {
    // Expandir panel
    const panel = page.locator('p-panel').filter({ hasText: /filtros avanzados/i });
    await panel.locator('button').first().click();

    // Seleccionar sexo Hembra
    const sexoSelect = panel.locator('p-select').nth(0);
    await sexoSelect.click();
    await page.getByRole('option', { name: 'Hembra' }).click();

    // Aplicar
    await panel.getByRole('button', { name: /aplicar/i }).click();

    await page.waitForTimeout(1500);
    const filas = page.locator('tbody tr');
    const count = await filas.count();
    if (count > 0) {
      await expect(filas.first().locator('td').nth(3)).toHaveText(/hembra|H/i);
    }
  });

  test('filtrar por rango de peso', async ({ page }) => {
    const panel = page.locator('p-panel').filter({ hasText: /filtros avanzados/i });
    await panel.locator('button').first().click();

    const pesoMinInput = panel.locator('p-inputnumber').nth(0).locator('input');
    await pesoMinInput.fill('10');

    await panel.getByRole('button', { name: /aplicar/i }).click();
    await expect(page.locator('p-table, table')).toBeVisible({ timeout: 5_000 });
  });

  test('limpiar filtros restaura la lista completa', async ({ page }) => {
    const panel = page.locator('p-panel').filter({ hasText: /filtros avanzados/i });
    await panel.locator('button').first().click();

    // Aplicar un filtro
    const sexoSelect = panel.locator('p-select').nth(0);
    await sexoSelect.click();
    await page.getByRole('option', { name: 'Macho' }).click();
    await panel.getByRole('button', { name: /aplicar/i }).click();
    await page.waitForTimeout(800);
    const countFiltrado = await page.locator('tbody tr').count();

    // Limpiar
    await panel.getByRole('button', { name: /limpiar/i }).click();
    await page.waitForTimeout(800);
    const countTotal = await page.locator('tbody tr').count();

    expect(countTotal).toBeGreaterThanOrEqual(countFiltrado);
  });
});
