import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Certificate,
  CertificateDto,
  CertificateTableData,
  CertificateFormData,
  CreateCertificateDto,
} from '../models/certificate.dto';
import { LaravelApiResponse, LaravelSingleItemResponse, LaravelPaginationResponse } from '../../../core/models/DTOs';

@Injectable({
  providedIn: 'root',
})
export class CertificatesService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/certificates`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene lista paginada de certificados con filtros
   */
  getCertificates(
    page: number = 1,
    perPage: number = 10,
    filters?: {
      cod_animal?: string;
      cod_criador?: string;
      cod_propietario?: string;
      search?: string;
    }
  ): Observable<LaravelApiResponse<LaravelPaginationResponse<Certificate>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (filters) {
      if (filters.cod_animal) {
        params = params.set('cod_animal', filters.cod_animal);
      }
      if (filters.cod_criador) {
        params = params.set('cod_criador', filters.cod_criador);
      }
      if (filters.cod_propietario) {
        params = params.set('cod_propietario', filters.cod_propietario);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }

    return this.http.get<LaravelApiResponse<LaravelPaginationResponse<Certificate>>>(
      this.baseUrl,
      { params }
    );
  }

  /**
   * Obtiene un certificado por ID
   */
  getCertificateById(id: number): Observable<LaravelSingleItemResponse<Certificate>> {
    return this.http.get<LaravelSingleItemResponse<Certificate>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene información completa del certificado
   */
  getCertificateWithCompleteInfo(id: number): Observable<LaravelSingleItemResponse<CertificateDto>> {
    return this.http.get<LaravelSingleItemResponse<CertificateDto>>(`${this.baseUrl}/${id}/complete-info`);
  }

  /**
   * Crea un nuevo certificado (método simplificado)
   */
  createCertificate(
    certificate: CreateCertificateDto
  ): Observable<LaravelSingleItemResponse<Certificate>> {
    return this.http.post<LaravelSingleItemResponse<Certificate>>(this.baseUrl, certificate);
  }

  /**
   * Crea un nuevo certificado (método legacy)
   */
  createCertificateLegacy(
    certificate: CertificateFormData
  ): Observable<LaravelSingleItemResponse<Certificate>> {
    return this.http.post<LaravelSingleItemResponse<Certificate>>(this.baseUrl, certificate);
  }

  /**
   * Actualiza un certificado existente
   */
  updateCertificate(
    id: number,
    certificate: Partial<CertificateFormData>
  ): Observable<LaravelSingleItemResponse<Certificate>> {
    return this.http.put<LaravelSingleItemResponse<Certificate>>(`${this.baseUrl}/${id}`, certificate);
  }

  /**
   * Elimina un certificado
   */
  deleteCertificate(id: number): Observable<LaravelApiResponse<any>> {
    return this.http.delete<LaravelApiResponse<any>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Busca certificados por término de búsqueda
   */
  searchCertificates(
    query: string,
    page: number = 1,
    perPage: number = 10
  ): Observable<LaravelApiResponse<LaravelPaginationResponse<Certificate>>> {
    let params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<LaravelApiResponse<LaravelPaginationResponse<Certificate>>>(
      `${this.baseUrl}/search`,
      { params }
    );
  }

  /**
   * Obtiene lista de animales para selección
   */
  getAnimalsForSelection(search?: string): Observable<LaravelApiResponse<any>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<LaravelApiResponse<any>>(
      `${environment.apiUrl}/api/v1/animals`,
      { params }
    );
  }

  /**
   * Obtiene lista de socios para selección
   */
  getSociosForSelection(search?: string): Observable<LaravelApiResponse<any>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<LaravelApiResponse<any>>(
      `${environment.apiUrl}/api/v1/socios`,
      { params }
    );
  }

  /**
   * Obtiene lista de clasificadores para selección
   */
  getClasificadoresForSelection(
    search?: string
  ): Observable<LaravelApiResponse<any>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<LaravelApiResponse<any>>(
      `${environment.apiUrl}/api/v1/clasificadores`,
      { params }
    );
  }

  /**
   * Genera número de certificado
   */
  generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 999999) + 1;
    return `${year}${randomNum.toString().padStart(6, '0')}`;
  }

  /**
   * Valida datos del certificado simplificado
   */
  validateCreateCertificateData(certificate: CreateCertificateDto): string[] {
    const errors: string[] = [];

    if (!certificate.cod_animal?.trim()) {
      errors.push('El código del animal es requerido');
    }

    if (!certificate.ced_clasificador?.trim()) {
      errors.push('La cédula del clasificador es requerida');
    }

    return errors;
  }

  /**
   * Valida datos del certificado (método legacy)
   */
  validateCertificateData(certificate: CertificateFormData): string[] {
    const errors: string[] = [];

    if (!certificate.cod_animal?.trim()) {
      errors.push('El código del animal es requerido');
    }

    if (!certificate.cod_finca?.trim()) {
      errors.push('El código de la finca es requerido');
    }

    if (!certificate.cod_criador?.trim()) {
      errors.push('El código del criador es requerido');
    }

    if (!certificate.cod_propietario?.trim()) {
      errors.push('El código del propietario es requerido');
    }

    if (!certificate.cod_clasificador?.trim()) {
      errors.push('El código del clasificador es requerido');
    }

    if (!certificate.fecha_emision?.trim()) {
      errors.push('La fecha de emisión es requerida');
    } else {
      const fechaEmision = new Date(certificate.fecha_emision);
      const hoy = new Date();
      if (fechaEmision > hoy) {
        errors.push('La fecha de emisión no puede ser futura');
      }
    }

    return errors;
  }

  /**
   * Formatea fecha para mostrar
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  /**
   * Convierte Certificate a CertificateTableData para la tabla
   */
  mapToTableData(certificates: Certificate[]): CertificateTableData[] {
    return certificates.map((cert) => ({
      id: cert.id,
      numero_certificado: cert.numero_certificado,
      cod_animal: cert.cod_animal,
      nomb_animal: cert.animal?.nomb_animal || '',
      cod_criador: cert.cod_criador,
      nombre_criador: cert.finca_criador?.nomb_finca || cert.animal?.finca?.nomb_finca || '',
      cod_propietario: cert.cod_propietario,
      nombre_propietario: cert.finca_propietario?.nomb_finca || cert.animal?.finca_actual?.nomb_finca || '',
      cod_clasificador: cert.cod_clasificador,
      nombre_clasificador: cert.clasificador?.persona
        ? `${cert.clasificador.persona.nom_persona} ${cert.clasificador.persona.ape_persona}`
        : 'Sin asignar',
      fecha_emision: cert.fecha_emision,
      is_active: cert.is_active,
    }));
  }
}
