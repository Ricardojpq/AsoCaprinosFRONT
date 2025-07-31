import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '@environments/environment';

export const authConfig: AuthConfig = {
  // URL del servidor de autorización (nuestro backend Laravel)
  issuer: `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}`,
  
  // URL de redirección después del login
  redirectUri: window.location.origin + '/Auth/Login',
  
  // ID del cliente (configurado en Laravel Passport)
  clientId: 'asocabra-client',
  
  // Tipo de respuesta esperada
  responseType: 'code',
  
  // Scope solicitado
  scope: 'openid profile email',
  
  // Configuración para usar cookies en lugar de localStorage
  useSilentRefresh: true,
  silentRefreshTimeout: 5000,
  
  // Configuración para manejar tokens con cookies
  requireHttps: false,
  showDebugInformation: environment.production === false,
  
  // Configuración para el manejo de sesiones
  sessionChecksEnabled: true,
  clearHashAfterLogin: true,
  
  // Configuración para el refresh automático
  timeoutFactor: 0.75,
  
  // Configuración para el manejo de errores
  disableAtHashCheck: true,
  
  // Configuración para el manejo de cookies
  // withCredentials se maneja en el interceptor
  
  // Endpoints personalizados para Laravel Passport
  // Los endpoints se manejan en el servicio personalizado
  
  // Configuración para el manejo de tokens
  // Los tiempos se manejan en el servicio personalizado
}; 