import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    access_token: string;
    expires_in: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class JwtAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkInitialAuth();
  }

  /**
   * Verificar autenticación inicial
   */
  private checkInitialAuth(): void {
    const token = this.getAccessToken();
    if (token && this.isTokenValid(token)) {
      // No cargar perfil automáticamente para evitar bucles
      // El perfil se cargará cuando sea necesario
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Login con credenciales
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth/login`,
      { email, password }
    ).pipe(
      tap(response => {
        if (response.status === 'success') {
          this.setAccessToken(response.data.access_token);
          this.currentUserSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError(error => {
        console.error('❌ Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    const accessToken = this.getAccessToken();

    if (accessToken) {
      this.http.post(
        `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth/logout`,
        { access_token: accessToken }
      ).subscribe({
        next: () => console.log('✅ Logout exitoso'),
        error: (error) => console.error('❌ Error en logout:', error)
      });
    }

    this.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/Auth/Login']);
  }

  /**
   * Cargar perfil de usuario
   */
  loadUserProfile(): Observable<User> {
    return this.http.get<{ status: string; data: User }>(
      `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth/user`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.data),
      tap(user => {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        console.error('❌ Error al cargar perfil:', error);
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token ? this.isTokenValid(token) : false;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener headers de autorización
   */
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Verificar si el token es válido
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() < expirationTime;
    } catch (error) {
      console.error('❌ Error al validar token:', error);
      return false;
    }
  }

  /**
   * Obtener access token desde cookie
   */
  private getAccessToken(): string | null {
    return this.getCookie('access_token');
  }

  /**
   * Establecer access token en cookie
   */
  private setAccessToken(token: string): void {
    this.setCookie('access_token', token, 12); // 12 horas (configuración del backend)
  }

  /**
   * Limpiar tokens
   */
  private clearTokens(): void {
    this.deleteCookie('access_token');
  }

  /**
   * Establecer cookie
   */
  private setCookie(name: string, value: string, hours: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (hours * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Obtener cookie
   */
  private getCookie(name: string): string | null {
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
  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  /**
   * Manejar error 401
   */
  handleUnauthorized(): void {
    console.log('🔒 Error 401 - Redirigiendo al login');
    this.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/Auth/Login']);
  }
} 