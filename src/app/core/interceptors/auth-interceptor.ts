import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);

  const isApiRequest = request.url.includes('/api/');

  // Si no es una petición a la API, no interceptar
  if (!isApiRequest) {
    return next(request);
  }

  // Agregar withCredentials para que el browser envíe la cookie HttpOnly automáticamente
  const authReq = request.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isLoginRequest = request.url.includes('/auth/login');
        const isRegisterRequest = request.url.includes('/auth/register');
        const isLogoutRequest = request.url.includes('/auth/logout');
        const isAlreadyOnLogin = router.url.includes('/Auth/Login');

        if (!isLoginRequest && !isRegisterRequest && !isLogoutRequest && !isAlreadyOnLogin) {
          // Limpiar expiración local
          try { localStorage.removeItem('auth_expires_at'); } catch {}

          router.navigate(['/Auth/Login']);
        }
      }
      return throwError(() => error);
    })
  );
};