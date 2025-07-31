import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { User } from '@features/auth/models/user';

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    expires_in: number;
    refresh_expires_in: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PassportOAuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private oauthService: OAuthService,
    private http: HttpClient
  ) {
    this.initializeOAuth();
    this.checkInitialSession();
  }

  private initializeOAuth() {
    // Configurar OAuth2
    this.oauthService.configure({
      issuer: `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth`,
      redirectUri: window.location.origin + '/Auth/Login',
      clientId: '01984836-7fde-710f-b40d-c79601928d35',
      responseType: 'code',
      scope: 'openid profile email',
      useSilentRefresh: false,
      silentRefreshTimeout: 5000,
      requireHttps: false,
      showDebugInformation: environment.production === false,
      sessionChecksEnabled: false,
      clearHashAfterLogin: true,
      timeoutFactor: 0.75,
      disableAtHashCheck: true
      // Los endpoints se manejan en el servicio personalizado
    });

    // No configurar refresh automático para evitar bucles
    // this.oauthService.setupAutomaticSilentRefresh();
  }

  // Login con credenciales usando HTTP directo
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.status === 'success' && response.data?.user) {
          this.userSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
          this.errorSubject.next(null);
          
          // Los tokens se manejan automáticamente por las cookies
          console.log('Login exitoso, tokens configurados automáticamente');
        }
      }),
      catchError(error => {
        this.errorSubject.next(error.error?.message || 'Error de conexión');
        return throwError(() => error);
      })
    );
  }

  // Refresh token
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.status === 'success' && response.data?.user) {
          this.userSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
          this.errorSubject.next(null);
        }
      }),
      catchError(error => {
        this.errorSubject.next(error.error?.message || 'Error al refrescar token');
        return throwError(() => error);
      })
    );
  }

  // Logout
  logout(): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.clearSession();
        this.oauthService.logOut();
      }),
      catchError(error => {
        this.clearSession();
        this.oauthService.logOut();
        return throwError(() => error);
      })
    );
  }

  // Obtener usuario actual
  getUser(): Observable<User | null> {
    if (this.userSubject.value) {
      return of(this.userSubject.value);
    }

    return this.http.get<AuthResponse>(
      `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth/user`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        if (response.status === 'success' && response.data?.user) {
          this.userSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
          return response.data.user;
        }
        return null;
      }),
      catchError(error => {
        this.clearSession();
        return of(null);
      })
    );
  }

  // Validar sesión
  validateSession(): Observable<boolean> {
    return this.getUser().pipe(
      map(user => !!user),
      catchError(() => of(false))
    );
  }

  // Limpiar sesión
  private clearSession() {
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.errorSubject.next(null);
  }

  // Getters para signals
  get user$(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get error$(): Observable<string | null> {
    return this.errorSubject.asObservable();
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get error(): string | null {
    return this.errorSubject.value;
  }

  // Métodos de OAuthService - Usar nuestro estado de autenticación
  get hasValidAccessToken(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get hasValidIdToken(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get accessToken(): string {
    return this.isAuthenticatedSubject.value ? 'valid' : '';
  }

  get idToken(): string {
    return this.isAuthenticatedSubject.value ? 'valid' : '';
  }

  // Verificar sesión inicial
  private checkInitialSession() {
    console.log('🔍 Verificando sesión inicial...');
    this.validateSession().subscribe({
      next: (isValid) => {
        if (isValid) {
          console.log('✅ Sesión válida encontrada al inicializar');
        } else {
          console.log('❌ No hay sesión válida al inicializar');
        }
      },
      error: (error) => {
        console.log('❌ Error al verificar sesión inicial:', error);
      }
    });
  }

  // Configurar token manualmente (para Laravel Passport)
  setAccessToken(token: string, expiresIn: number) {
    // Los tokens se manejan automáticamente por las cookies
    console.log('Token configurado:', token, 'Expira en:', expiresIn);
  }
} 