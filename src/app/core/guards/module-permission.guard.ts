import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionsService } from '@core/services/permissions.service';

/**
 * Guard que verifica si el usuario tiene permiso para ver un módulo específico.
 * Uso en rutas:
 * {
 *   path: 'Animals',
 *   canActivate: [modulePermissionGuard('Animals')],
 *   loadComponent: () => ...
 * }
 */
export function modulePermissionGuard(moduleVista: string): CanActivateFn {
  return () => {
    const permissionsService = inject(PermissionsService);
    const router = inject(Router);

    if (permissionsService.canView(moduleVista)) {
      return true;
    }

    // Redirigir a página de acceso denegado o dashboard
    router.navigate(['/Dashboard']);
    return false;
  };
}

/**
 * Guard genérico que extrae el módulo de la ruta actual
 */
export const dynamicModulePermissionGuard: CanActivateFn = (route) => {
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  // Obtener la vista del módulo desde los datos de la ruta o la URL
  const moduleVista = route.data?.['moduleVista'] || route.routeConfig?.path || '';

  if (!moduleVista || permissionsService.canView(moduleVista)) {
    return true;
  }

  router.navigate(['/Dashboard']);
  return false;
};
