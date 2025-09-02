import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CertificateComponent } from './certificate.component';
import { CertificateService } from './certificate.service';
import { CertificateData } from '../../shared/models/certificate.models';

@Component({
  selector: 'app-certificate-demo',
  standalone: true,
  imports: [CertificateComponent],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
          Certificado de Registro Genealógico - Demo
        </h1>
        
        @if (currentCertificate(); as certificate) {
          <app-certificate 
            [certificateData]="certificate"
            [showBackgroundImage]="showBackground()">
          </app-certificate>
        } @else if (loading()) {
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            <p class="mt-4 text-gray-600">Cargando certificado...</p>
          </div>
        } @else {
          <div class="text-center py-12">
            <p class="text-gray-600">No hay certificados disponibles</p>
          </div>
        }
        
        <!-- Controls -->
        <div class="mt-8 text-center">
          <button 
            (click)="toggleBackground()"
            class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mr-4">
            {{ showBackground() ? 'Ocultar' : 'Mostrar' }} Fondo
          </button>
          <button 
            (click)="generateNewSample()"
            class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Generar Nuevo Ejemplo
          </button>
        </div>
      </div>
    </div>
  `
})
export class CertificateDemoComponent implements OnInit {
  private certificateService = inject(CertificateService);
  
  // Using signals for reactive state
  private _showBackground = signal(true);
  private _currentCertificate = signal<CertificateData | null>(null);
  
  // Computed properties
  showBackground = computed(() => this._showBackground());
  currentCertificate = computed(() => this._currentCertificate());
  loading = computed(() => this.certificateService.loading());
  
  ngOnInit(): void {
    this.loadSampleCertificate();
  }
  
  private loadSampleCertificate(): void {
    this.certificateService.getCertificates().subscribe({
      next: (certificates) => {
        if (certificates.length > 0) {
          this._currentCertificate.set(certificates[0]);
        }
      },
      error: (error) => {
        console.error('Error loading certificate:', error);
      }
    });
  }
  
  toggleBackground(): void {
    this._showBackground.update(current => !current);
  }
  
  generateNewSample(): void {
    const current = this._currentCertificate();
    if (!current) return;
    
    // Generate new sample data for demonstration
    const names = ['BELLA DE CARORA', 'ESTRELLA ALPINA', 'LUNA LECHERA', 'SOL DORADO'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNumber = Math.floor(Math.random() * 99999).toString();
    
    const newCertificate: CertificateData = {
      ...current,
      animal: {
        ...current.animal,
        name: randomName,
        registrationNumber: randomNumber
      }
    };
    
    this._currentCertificate.set(newCertificate);
  }
}