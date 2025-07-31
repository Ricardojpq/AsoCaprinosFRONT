import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { JwtAuthService } from '@core/services/jwt-auth.service';

@Component({
  selector: 'app-jwt-test',
  imports: [JsonPipe],
  template: `
    <div class="p-4">
      <h2>JWT Authentication Test</h2>
      
      <div class="mb-4">
        <h3>Estado JWT</h3>
        <p>Usuario autenticado: {{ jwtAuthService.isAuthenticated() }}</p>
        <p>Usuario actual: {{ userProfile?.name || 'No autenticado' }}</p>
        <p>Token en localStorage: {{ hasToken() }}</p>
      </div>

      <div class="mb-4">
        <h3>Acciones</h3>
        <button (click)="loginAdmin()" class="btn btn-primary mr-2">Login Admin</button>
        <button (click)="loginUser()" class="btn btn-success mr-2">Login User</button>
        <button (click)="loadUserProfile()" class="btn btn-secondary mr-2">Cargar Perfil</button>
        <button (click)="logout()" class="btn btn-danger">Logout</button>
      </div>

      @if (userProfile) {
        <div class="mb-4">
          <h3>Perfil de Usuario</h3>
          <pre>{{ userProfile | json }}</pre>
        </div>
      }

      @if (error) {
        <div class="mb-4">
          <h3>Error</h3>
          <p class="text-danger">{{ error }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .btn {
      padding: 0.5rem 1rem;
      margin: 0.25rem;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
    }
    .btn-primary { background-color: #007bff; color: white; }
    .btn-success { background-color: #28a745; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
    .btn-danger { background-color: #dc3545; color: white; }
    .text-danger { color: #dc3545; }
  `]
})
export class JwtTest {
  userProfile: any = null;
  error: string = '';

  constructor(
    public jwtAuthService: JwtAuthService
  ) {}

  loginAdmin() {
    console.log('🔄 Iniciando login como Admin...');
    this.jwtAuthService.login('admin@asocabra.com', 'password123').subscribe({
      next: (response: any) => {
        console.log('✅ Login Admin exitoso:', response);
        this.error = '';
      },
      error: (error: any) => {
        console.error('❌ Error en login Admin:', error);
        this.error = error.error?.message || 'Error en login Admin';
      }
    });
  }

  loginUser() {
    console.log('🔄 Iniciando login como User...');
    this.jwtAuthService.login('user@asocabra.com', 'password123').subscribe({
      next: (response: any) => {
        console.log('✅ Login User exitoso:', response);
        this.error = '';
      },
      error: (error: any) => {
        console.error('❌ Error en login User:', error);
        this.error = error.error?.message || 'Error en login User';
      }
    });
  }

  loadUserProfile() {
    console.log('👤 Cargando perfil de usuario...');
    this.jwtAuthService.loadUserProfile().subscribe({
      next: (user: any) => {
        console.log('✅ Perfil cargado:', user);
        this.userProfile = user;
        this.error = '';
      },
      error: (error: any) => {
        console.error('❌ Error al cargar perfil:', error);
        this.error = error.error?.message || 'Error al cargar perfil';
      }
    });
  }

  logout() {
    console.log('🚪 Haciendo logout...');
    this.jwtAuthService.logout();
    this.userProfile = null;
    this.error = '';
  }

  hasToken(): boolean {
    return !!this.getCookie('access_token');
  }

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
} 