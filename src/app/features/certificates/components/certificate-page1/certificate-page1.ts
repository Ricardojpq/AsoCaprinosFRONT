import { LucideAngularModule } from 'lucide-angular';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { SvgIconComponent } from "angular-svg-icon";
import { CertificateDto } from '@features/certificates/models/certificate.dto';

@Component({
  selector: 'app-certificate-page1',
  imports: [DatePipe, LucideAngularModule, SvgIconComponent],
  templateUrl: './certificate-page1.html',
  styleUrl: './certificate-page1.css'
})
export class CertificatePage1 {
 @Input() certificateData!: CertificateDto;
  // Helper para obtener el mes en español
  getMonthName(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { month: 'long' });
  }
}
