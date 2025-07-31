import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { JwtAuthService } from '@core/services/jwt-auth.service';

export const NoAuthGuard: CanActivateFn = async () => {
  const jwtAuthService = inject(JwtAuthService);
  const router = inject(Router);

  await new Promise(resolve => setTimeout(resolve, 100));

  // Si ya está autenticado localmente, redirigir al dashboard
  if (jwtAuthService.isAuthenticated()) {
    router.navigate(['/Dashboard']);
    return false;
  }

  // Si no está autenticado, permitir acceso a la página de login
  return true;
}; 