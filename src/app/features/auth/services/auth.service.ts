import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Signal, signal } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';
import { interval, Subscription } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { JwtAuthService } from '@core/services/jwt-auth.service';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private userSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private sessionCheckSubscription?: Subscription;

  constructor(
    private jwtAuthService: JwtAuthService,
    private router: Router, 
    private loadingService: LoadingService
  ) {
    this.initializeSession();
  }

  ngOnDestroy() {
    this.sessionCheckSubscription?.unsubscribe();
  }

  private initializeSession() {
    console.log('🔄 AuthService: Inicializando sesión con JWT...');
    
    // Suscribirse a los cambios del usuario
    this.jwtAuthService.currentUser$.subscribe((user: any) => {
      this.userSignal.set(user);
      this.isAuthenticatedSignal.set(!!user);
    });

    // Verificar sesión inicial sin hacer peticiones HTTP
    const token = this.jwtAuthService.isAuthenticated();
    if (token) {
      this.isAuthenticatedSignal.set(true);
    }
  }

  login(email: string, password: string) {
    console.log('🔐 AuthService: Iniciando login con JWT...', { email });
    this.loadingService.show();
    this.errorSignal.set(null);
    
    this.jwtAuthService.login(email, password).subscribe({
      next: (res: any) => {
        console.log('📥 AuthService: Respuesta del login', res);
        if (res.status === 'success' && res.data?.user) {
          console.log('✅ AuthService: Login exitoso', res.data.user);
          this.userSignal.set(res.data.user);
          this.isAuthenticatedSignal.set(true);
          this.errorSignal.set(null);
          this.router.navigate(['/Dashboard']);
        } else {
          this.errorSignal.set(res.message || 'Error en el login');
        }
        this.loadingService.hide();
      },
      error: (err: any) => {
        console.error('❌ AuthService: Error de login', err);
        let errorMessage = 'Error de conexión';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (err.status === 422) {
          errorMessage = 'Datos inválidos';
        } else if (err.status === 0) {
          errorMessage = 'No se puede conectar con el servidor';
        }
        this.errorSignal.set(errorMessage);
        this.loadingService.hide();
      }
    });
  }

  logout() {
    console.log('🚪 AuthService: Iniciando logout con JWT...');
    this.loadingService.show();
    this.errorSignal.set(null);
    
    this.jwtAuthService.logout();
    this.clearSession();
    this.router.navigate(['/Auth/Login']);
    this.loadingService.hide();
  }

  checkAuthenticationStatus() {
    console.log('🔍 AuthService: Verificando estado de autenticación con JWT...');
    
    // Verificar si hay un token válido localmente
    if (this.jwtAuthService.isAuthenticated()) {
      console.log('✅ AuthService: Token válido encontrado localmente');
      this.isAuthenticatedSignal.set(true);
    } else {
      console.log('❌ AuthService: No hay token válido');
      this.clearSession();
    }
  }

  private handleSessionExpired() {
    console.log('⏰ AuthService: Sesión expirada, limpiando...');
    this.clearSession();
    this.sessionCheckSubscription?.unsubscribe();
    this.sessionCheckSubscription = undefined;
    
    const currentUrl = this.router.url;
    if (!currentUrl.includes('/Auth/Login')) {
      console.log('🔄 AuthService: Redirigiendo al login por sesión expirada...');
      this.router.navigate(['/Auth/Login']);
    } else {
      console.log('⏭️ AuthService: Ya estamos en login, no redirigiendo');
    }
  }

  get user(): Signal<User | null> {
    return this.userSignal;
  }

  get isAuthenticated(): Signal<boolean> {
    return this.isAuthenticatedSignal;
  }

  get error(): Signal<string | null> {
    return this.errorSignal;
  }

  isAuthenticatedSync(): boolean {
    return this.isAuthenticatedSignal();
  }

  clearSession() {
    console.log('🧹 AuthService: Limpiando sesión local...');
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.errorSignal.set(null);
  }

  validateSession(): Promise<boolean> {
    console.log('🔍 AuthService: Validando sesión con JWT...');
    
    return new Promise((resolve) => {
      if (this.isAuthenticatedSync()) {
        console.log('⏭️ AuthService: Ya autenticado localmente, retornando true');
        resolve(true);
        return;
      }

      console.log('🌐 AuthService: Verificando token localmente...');
      
      if (this.jwtAuthService.isAuthenticated()) {
        console.log('✅ AuthService: Token válido encontrado');
        resolve(true);
      } else {
        console.log('❌ AuthService: No hay token válido');
        this.clearSession();
        resolve(false);
      }
    });
  }

  debugSession() {
    console.log('=== DEBUG SESSION ===');
    console.log('Estado local:', this.isAuthenticatedSync());
    console.log('Usuario:', this.userSignal());
    console.log('URL actual:', this.router.url);
    console.log('JWT - Autenticado:', this.jwtAuthService.isAuthenticated());
    console.log('=====================');
  }
} 