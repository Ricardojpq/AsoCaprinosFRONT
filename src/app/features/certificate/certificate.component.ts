import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateData } from '../../shared/models/certificate.models';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent {
  // Using Angular 20's input signals
  certificateData = input.required<CertificateData>();
  showBackgroundImage = input<boolean>(true);
  
  // Using signals for reactive state
  private _printMode = signal(false);
  
  // Computed properties using Angular 20's computed signals
  formattedBirthDate = computed(() => {
    const date = new Date(this.certificateData().animal.birthDate);
    return date.toLocaleDateString('es-ES');
  });
  
  formattedIssueDate = computed(() => {
    const date = new Date(this.certificateData().issueDate);
    return date.toLocaleDateString('es-ES');
  });
  
  isPrintMode = computed(() => this._printMode());
  
  // Methods
  togglePrintMode(): void {
    this._printMode.update(current => !current);
  }
  
  printCertificate(): void {
    this._printMode.set(true);
    setTimeout(() => {
      window.print();
      this._printMode.set(false);
    }, 100);
  }
  
  downloadCertificate(): void {
    // Implementation for downloading certificate as PDF
    console.log('Download functionality to be implemented');
  }
}