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
  perfil_id: number;
  perfil_name?: string;
  cod_finca?: number | null;
  token_expires_at?: string;
  is_super_admin?: boolean;
  is_admin_finca?: boolean;
  is_usuario_basico?: boolean;
  
  // Relaciones
  perfil?: {
    id_perfil: number;
    descripcion: string;
  };
  finca?: {
    cod_finca: number;
    nomb_finca: string;
  };
  // Multi-tenant
  fincas?: Array<{
    cod_finca: number;
    nomb_finca: string;
    es_principal?: boolean;
  }>;
  fincas_ids?: number[];
  // Permisos
  permisos?: { [page: string]: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean } };
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
    expires_in: number;
    expires_at: string;
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
   * Verificar autenticación inicial - Solo verifica expiración local, no hace peticiones HTTP
   */
  private checkInitialAuth(): void {
    const expiresAt = this.getStoredExpiration();
    if (expiresAt && Date.now() < expiresAt) {
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearLocalAuth();
    }
  }

  /**
   * Cargar perfil del usuario - Método público para llamar cuando sea necesario
   */
  loadUserProfileIfNeeded(): void {
    const expiresAt = this.getStoredExpiration();
    if (expiresAt && Date.now() < expiresAt && !this.currentUserSubject.value) {
      this.loadUserProfile().subscribe({
        error: (error: any) => {
          console.error('❌ Error al cargar perfil:', error);
          // Si falla, limpiar la sesión
          this.clearLocalAuth();
        }
      });
    }
  }

  /**
   * Login con credenciales
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap((response: AuthResponse) => {
        if (response.status === 'success') {
          this.storeExpiration(response.data.expires_at);
          this.currentUserSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    this.http.post(
      `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth/logout`,
      {},
      { withCredentials: true }
    ).subscribe({
      error: (error: any) => console.error('Error en logout:', error)
    });

    this.clearLocalAuth();
    this.router.navigate(['/Auth/Login']);
  }

  /**
   * Cargar perfil completo de usuario desde /auth/me
   */
  loadUserProfile(): Observable<User> {
    return this.http.get<{ status: string; message: string; data: User }>(
      `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/auth/me`,
      { withCredentials: true }
    ).pipe(
      map((response: { status: string; message: string; data: User }) => response.data),
      tap((user: User) => {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        console.error('Error al cargar perfil:', error);
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
    const expiresAt = this.getStoredExpiration();
    return expiresAt ? Date.now() < expiresAt : false;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener expiración almacenada localmente
   */
  private getStoredExpiration(): number | null {
    try {
      const val = localStorage.getItem('auth_expires_at');
      return val ? parseInt(val, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Almacenar solo la expiración
   */
  private storeExpiration(expiresAt: string): void {
    try {
      const ms = new Date(expiresAt).getTime();
      localStorage.setItem('auth_expires_at', ms.toString());
    } catch {
      // localStorage no disponible
    }
  }

  /**
   * Limpiar estado de autenticación local
   */
  private clearLocalAuth(): void {
    try {
      localStorage.removeItem('auth_expires_at');
    } catch {
      // localStorage no disponible
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Manejar error 401
   */
  handleUnauthorized(): void {
    this.clearLocalAuth();
    this.router.navigate(['/Auth/Login']);
  }
}