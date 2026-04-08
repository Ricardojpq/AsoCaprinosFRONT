import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Signal, signal } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';
import { interval, Subscription } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { JwtAuthService } from '@core/services/jwt-auth.service';
import { FarmContextService } from '@core/services/farm-context.service';
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
    private loadingService: LoadingService,
    private farmContext: FarmContextService
  ) {
    this.initializeSession();
  }
  ngOnDestroy() {
    this.sessionCheckSubscription?.unsubscribe();
  }

  private initializeSession() {
    // Suscribirse a los cambios del usuario
    this.jwtAuthService.currentUser$.subscribe((user: any) => {
      this.userSignal.set(user);
      this.isAuthenticatedSignal.set(!!user);
      
      // Inicializar finca en localStorage cuando el usuario se carga
      if (user) {
        this.initializeFincaFromUser(user);
      }
    });

    // Verificar sesión inicial y cargar perfil inmediatamente
    const isAuth = this.jwtAuthService.isAuthenticated();
    if (isAuth) {
      this.isAuthenticatedSignal.set(true);
      this.jwtAuthService.loadUserProfileIfNeeded();
    }
  }

  login(email: string, password: string) {
    this.loadingService.show();
    
    this.jwtAuthService.login(email, password).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data?.user) {
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
        console.error('AuthService: Error de login', err);
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
    this.loadingService.show();
    this.errorSignal.set(null);
    
    this.jwtAuthService.logout();
    this.clearSession();
    this.router.navigate(['/Auth/Login']);
    this.loadingService.hide();
  }

  checkAuthenticationStatus() {
    // Verificar si hay un token válido localmente
    const isAuth = this.jwtAuthService.isAuthenticated();
    if (isAuth) {
      this.isAuthenticatedSignal.set(true);
    } else {
      this.clearSession();
    }
  }

  private handleSessionExpired() {
    this.clearSession();
    this.sessionCheckSubscription?.unsubscribe();
    this.sessionCheckSubscription = undefined;
    
    const currentUrl = this.router.url;
    if (!currentUrl.includes('/Auth/Login')) {
      this.router.navigate(['/Auth/Login']);
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
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.errorSignal.set(null);
    this.farmContext.clear();
  }

  /**
   * Inicializa la finca seleccionada en localStorage basándose en el usuario
   */
  private initializeFincaFromUser(user: any): void {
    const fincas = user.fincas || [];
    if (fincas.length === 0) return;

    // Si ya hay una finca válida en localStorage, no cambiarla
    const storedFinca = this.farmContext.getSelectedFarm();
    if (storedFinca && fincas.some((f: any) => f.cod_finca === storedFinca)) {
      return;
    }

    // Seleccionar finca principal o la primera
    const principal = fincas.find((f: any) => f.es_principal);
    const defaultFinca = principal || fincas[0];
    this.farmContext.setSelectedFarm(defaultFinca.cod_finca);
  }

  validateSession(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isAuthenticatedSync()) {
        resolve(true);
        return;
      }

      const isAuth = this.jwtAuthService.isAuthenticated();
      if (isAuth) {
        resolve(true);
      } else {
        this.clearSession();
        resolve(false);
      }
    });
  }

}