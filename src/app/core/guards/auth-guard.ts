import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtAuthService } from '@core/services/jwt-auth.service';

export const AuthGuard: CanActivateFn = () => {
  const jwtAuthService = inject(JwtAuthService);
  const router = inject(Router);

  if (jwtAuthService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/Auth/Login']);
  return false;
};