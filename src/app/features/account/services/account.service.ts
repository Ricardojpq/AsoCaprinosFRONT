import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly apiUrl = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}`;

  constructor(private http: HttpClient) {}

  /**
   * Actualizar perfil de usuario
   * TODO: Implementar endpoint en el backend
   */
  updateProfile(profileData: UpdateProfileRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/auth/profile`,
      profileData
    );
  }

  /**
   * Cambiar contraseña
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/auth/change-password`,
      passwordData
    );
  }

  /**
   * Obtener configuraciones de seguridad del usuario
   * TODO: Implementar endpoint en el backend para funcionalidades futuras
   */
  getSecuritySettings(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/auth/security-settings`
    );
  }

  /**
   * Actualizar configuraciones de seguridad
   * TODO: Implementar endpoint en el backend para funcionalidades futuras
   */
  updateSecuritySettings(settings: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/auth/security-settings`,
      settings
    );
  }
}
