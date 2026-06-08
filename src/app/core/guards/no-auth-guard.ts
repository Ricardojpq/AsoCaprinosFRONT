import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtAuthService } from '@core/services/jwt-auth.service';

export const NoAuthGuard: CanActivateFn = () => {
  const jwtAuthService = inject(JwtAuthService);
  const router = inject(Router);

  if (jwtAuthService.isAuthenticated()) {
    router.navigate(['/Dashboard']);
    return false;
  }

  return true;
}; 