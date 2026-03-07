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

  // Solo interceptar peticiones a la API que no sean de autenticación
  const isApiRequest = request.url.includes('/api/');
  const isAuthRequest = request.url.includes('/auth/login') || 
                       request.url.includes('/auth/register') ||
                       request.url.includes('/auth/me');

  // Si no es una petición a la API o es una petición de autenticación, no interceptar
  if (!isApiRequest || isAuthRequest) {
    return next(request);
  }

  // Agregar token si existe
  const token = getCookie('access_token');
  let authReq = request;
  
  if (token) {
    authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es un error de autenticación
      if (error.status === 401) {
        const isLoginRequest = request.url.includes('/auth/login');
        const isRegisterRequest = request.url.includes('/auth/register');
        const isLogoutRequest = request.url.includes('/auth/logout');
        const isAlreadyOnLogin = router.url.includes('/Auth/Login');

        // Si no es una petición de autenticación y no estamos ya en login
        if (!isLoginRequest && !isRegisterRequest && !isLogoutRequest && !isAlreadyOnLogin) {
          console.log('🔒 Interceptor: Error 401, limpiando sesión y redirigiendo al login');
          
          // Limpiar token de la cookie
          deleteCookie('access_token');
          
          // Redirigir al login
          router.navigate(['/Auth/Login']);
        }
      }
      return throwError(() => error);
    })
  );
};

/**
 * Obtener cookie
 */
function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Eliminar cookie
 */
function deleteCookie(name: string): void {
  const cookieParts = [
    `${name}=`,
    'expires=Thu, 01 Jan 1970 00:00:00 UTC',
    'path=/',
    'SameSite=Strict'
  ];
  
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    cookieParts.push('Secure');
  }
  
  document.cookie = cookieParts.join(';');
} 