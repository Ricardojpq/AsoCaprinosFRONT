import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { JwtAuthService } from '@core/services/jwt-auth.service';

export const AuthGuard: CanActivateFn = async () => {
  const jwtAuthService = inject(JwtAuthService);
  const router = inject(Router);

  await new Promise(resolve => setTimeout(resolve, 100));

  // Si ya está autenticado localmente, permitir acceso
  if (jwtAuthService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, redirigir al login
  router.navigate(['/Auth/Login']);
  return false;
}; 