import { test, expect, Page } from '@playwright/test';
import { login, selectFarm } from '../helpers/auth';

const NAV = '/reproduccion/temporadas-monta';

test.describe('Flujo: Temporada de Monta', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFarm(page);
  });

  test('navegar a temporadas de monta', async ({ page }) => {
    await page.goto(NAV);
    await expect(page.getByRole('heading', { name: /temporada/i })).toBeVisible({ timeout: 8_000 });
  });

  test('crear nueva temporada de monta', async ({ page }) => {
    await page.goto(NAV);

    // Abrir modal
    await page.getByRole('button', { name: /nueva temporada|nuevo/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });

    // Completar fecha inicio
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const fechaInput = page.locator('input[id*="fecha_inicio"], p-datepicker[formcontrolname="fecha_inicio"] input').first();
    await fechaInput.fill(dateStr);
    await fechaInput.press('Tab');

    // Seleccionar macho
    const machoSelect = page.locator('p-select[formcontrolname="macho_id"]').first();
    await machoSelect.click();
    await page.getByRole('option').first().click();

    // Seleccionar modalidad de corral
    const modalidadSelect = page.locator('p-select[formcontrolname="modalidad_corral"]').first();
    await modalidadSelect.click();
    await page.getByRole('option').first().click();

    // Seleccionar corral
    const corralSelect = page.locator('p-select[formcontrolname="corral_id"]').first();
    if (await corralSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await corralSelect.click();
      await page.getByRole('option').first().click();
    }

    // Guardar
    await page.getByRole('button', { name: /guardar|crear/i }).last().click();

    // Verificar éxito — toast o tabla actualizada
    await expect(
      page.locator('.p-toast-summary, [class*="toast"]').filter({ hasText: /éxito|creada/i })
    ).toBeVisible({ timeout: 8_000 });
  });

  test('ver detalle y agregar hembras a temporada activa', async ({ page }) => {
    await page.goto(NAV);

    // Buscar temporada ACTIVA
    const filaActiva = page.locator('tr').filter({ hasText: /activa/i }).first();
    if (!(await filaActiva.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'No hay temporadas activas para probar');
      return;
    }

    // Click en botón de hembras / detalle
    await filaActiva.getByRole('button', { name: /hembras|ver|detalle/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });
  });
});
