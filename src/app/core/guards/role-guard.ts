import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { JwtAuthService } from '@core/services/jwt-auth.service';

/**
 * Guard para verificar roles de usuario.
 * Uso en rutas: canActivate: [RoleGuard], data: { roles: [1, 2] }
 */
export const RoleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const jwtAuthService = inject(JwtAuthService);
  const router = inject(Router);

  // Verificar autenticación
  if (!jwtAuthService.isAuthenticated()) {
    router.navigate(['/Auth/Login']);
    return false;
  }

  // Obtener roles requeridos de la ruta
  const requiredRoles = route.data['roles'] as number[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // Sin restricción de roles
  }

  const user = jwtAuthService.getCurrentUser();
  
  if (!user) {
    // Intentar cargar el perfil
    try {
      await jwtAuthService.loadUserProfile().toPromise();
      const loadedUser = jwtAuthService.getCurrentUser();
      if (loadedUser && requiredRoles.includes(loadedUser.perfil_id)) {
        return true;
      }
    } catch {
      router.navigate(['/Auth/Login']);
      return false;
    }
  }

  // Verificar si el usuario tiene alguno de los roles requeridos
  if (user && requiredRoles.includes(user.perfil_id)) {
    return true;
  }

  // Usuario no tiene el rol requerido
  console.warn('🚫 RoleGuard: Acceso denegado. Rol requerido:', requiredRoles, 'Rol actual:', user?.perfil_id);
  router.navigate(['/Dashboard']);
  return false;
};

/**
 * Guard específico para SuperAdmin (perfil_id = 1)
 */
export const SuperAdminGuard: CanActivateFn = async () => {
  const jwtAuthService = inject(JwtAuthService);
  const router = inject(Router);

  if (!jwtAuthService.isAuthenticated()) {
    router.navigate(['/Auth/Login']);
    return false;
  }

  const user = jwtAuthService.getCurrentUser();
  
  if (!user) {
    try {
      await jwtAuthService.loadUserProfile().toPromise();
      const loadedUser = jwtAuthService.getCurrentUser();
      if (loadedUser?.perfil_id === 1) {
        return true;
      }
    } catch {
      router.navigate(['/Auth/Login']);
      return false;
    }
  }

  if (user?.perfil_id === 1) {
    return true;
  }

  console.warn('🚫 SuperAdminGuard: Acceso denegado. Solo SuperAdmin puede acceder.');
  router.navigate(['/Dashboard']);
  return false;
};
