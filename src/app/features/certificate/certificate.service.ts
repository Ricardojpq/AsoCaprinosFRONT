import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { CertificateData } from '../../shared/models/certificate.models';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private readonly http = inject(HttpClient);
  
  // Using signals for reactive state management
  private _certificates = signal<CertificateData[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  
  // Public computed signals
  certificates = computed(() => this._certificates());
  loading = computed(() => this._loading());
  error = computed(() => this._error());
  certificateCount = computed(() => this._certificates().length);
  
  /**
   * Get all certificates
   */
  getCertificates(): Observable<CertificateData[]> {
    this._loading.set(true);
    this._error.set(null);
    
    // Simulated API call - replace with actual endpoint
    return new Observable(observer => {
      setTimeout(() => {
        const mockCertificates: CertificateData[] = [
          this.getMockCertificateData()
        ];
        
        this._certificates.set(mockCertificates);
        this._loading.set(false);
        observer.next(mockCertificates);
        observer.complete();
      }, 1000);
    });
  }
  
  /**
   * Get certificate by ID
   */
  getCertificateById(id: string): Observable<CertificateData | null> {
    this._loading.set(true);
    this._error.set(null);
    
    return new Observable(observer => {
      setTimeout(() => {
        const certificate = this._certificates().find(cert => 
          cert.animal.registrationNumber === id
        ) || null;
        
        this._loading.set(false);
        observer.next(certificate);
        observer.complete();
      }, 500);
    });
  }
  
  /**
   * Create new certificate
   */
  createCertificate(certificateData: CertificateData): Observable<CertificateData> {
    this._loading.set(true);
    this._error.set(null);
    
    return new Observable(observer => {
      setTimeout(() => {
        const newCertificate = { ...certificateData };
        this._certificates.update(certs => [...certs, newCertificate]);
        this._loading.set(false);
        observer.next(newCertificate);
        observer.complete();
      }, 1000);
    });
  }
  
  /**
   * Update existing certificate
   */
  updateCertificate(id: string, certificateData: Partial<CertificateData>): Observable<CertificateData> {
    this._loading.set(true);
    this._error.set(null);
    
    return new Observable(observer => {
      setTimeout(() => {
        this._certificates.update(certs => 
          certs.map(cert => 
            cert.animal.registrationNumber === id 
              ? { ...cert, ...certificateData }
              : cert
          )
        );
        
        const updatedCert = this._certificates().find(cert => 
          cert.animal.registrationNumber === id
        );
        
        this._loading.set(false);
        if (updatedCert) {
          observer.next(updatedCert);
        } else {
          this._error.set('Certificate not found');
          observer.error('Certificate not found');
        }
        observer.complete();
      }, 1000);
    });
  }
  
  /**
   * Delete certificate
   */
  deleteCertificate(id: string): Observable<boolean> {
    this._loading.set(true);
    this._error.set(null);
    
    return new Observable(observer => {
      setTimeout(() => {
        const initialLength = this._certificates().length;
        this._certificates.update(certs => 
          certs.filter(cert => cert.animal.registrationNumber !== id)
        );
        
        const success = this._certificates().length < initialLength;
        this._loading.set(false);
        observer.next(success);
        observer.complete();
      }, 500);
    });
  }
  
  /**
   * Generate PDF certificate
   */
  generatePDF(certificateData: CertificateData): Observable<Blob> {
    this._loading.set(true);
    
    return new Observable(observer => {
      // This would integrate with a PDF generation library
      // For now, we'll simulate the process
      setTimeout(() => {
        const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
        this._loading.set(false);
        observer.next(mockBlob);
        observer.complete();
      }, 2000);
    });
  }
  
  /**
   * Validate certificate data
   */
  validateCertificateData(data: Partial<CertificateData>): string[] {
    const errors: string[] = [];
    
    if (!data.animal?.name) {
      errors.push('El nombre del animal es requerido');
    }
    
    if (!data.animal?.registrationNumber) {
      errors.push('El número de registro es requerido');
    }
    
    if (!data.animal?.sex || !['HEMBRA', 'MACHO'].includes(data.animal.sex)) {
      errors.push('El sexo debe ser HEMBRA o MACHO');
    }
    
    if (!data.animal?.birthDate) {
      errors.push('La fecha de nacimiento es requerida');
    }
    
    if (!data.owner?.name) {
      errors.push('La información del propietario es requerida');
    }
    
    if (!data.breeder?.name) {
      errors.push('La información del criador es requerida');
    }
    
    return errors;
  }
  
  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }
  
  /**
   * Get mock certificate data for testing
   */
  private getMockCertificateData(): CertificateData {
    return {
      animal: {
        name: 'CIGARRONA DE SOMBRERITO',
        associationId: '55',
        registrationNumber: '13424',
        sex: 'HEMBRA',
        birthDate: '2023-06-25',
        tattoos: {
          leftEar: 'SR',
          rightEar: '2335',
          tailLip: 'N/P'
        },
        racialClassification: 'ALPINA',
        racialType: 'A5(50% A)',
        score: 85,
        coatDescription: 'Pelaje característico de cabra lechera alpina con tonalidades marrones y blancas'
      },
      owner: {
        id: 'ASR',
        name: 'APRISCO SOMBRERITO RANCH',
        farmName: 'APRISCO SOMBRERITO RANCH',
        address: 'CARRT. LARA ZULIA, SECTOR SAN JOAQUIN, MUNICIPIO TORRES, LAPA'
      },
      breeder: {
        id: 'ASR',
        name: 'APRISCO SOMBRERITO RANCH',
        farmName: 'APRISCO SOMBRERITO RANCH',
        address: 'CARRT. LARA ZULIA, SECTOR SAN JOAQUIN, MUNICIPIO TORRES, LAPA'
      },
      genealogy: {
        father: {
          name: 'ANTIAS CRA KK RED BULL',
          associationId: 'HV26 / M532',
          internationalId: '10650'
        },
        mother: {
          name: 'ESPAÑA DE SOMBRERITO',
          associationId: 'SR / 2002',
          internationalId: 'N/P'
        },
        paternalGrandfather: {
          name: 'JOACHIS CC KAZAA KLEIN',
          associationId: 'sí / s/i',
          internationalId: 'A00466180 / ADGA'
        },
        paternalGrandmother: {
          name: 'XTRAO ORDINARY ACTION STICK',
          associationId: 'KS / XDI',
          internationalId: 'AA1995354 / ADGA'
        },
        maternalGrandfather: {
          name: 'SM',
          associationId: 's/i / s/i',
          internationalId: 'N/P'
        },
        maternalGrandmother: {
          name: 'SM',
          associationId: 's/i / s/i',
          internationalId: 'N/P'
        }
      },
      issueDate: '2024-03-12',
      classifier: {
        name: 'Dr. Juan Pérez',
        id: 'CLAS001'
      }
    };
  }
}