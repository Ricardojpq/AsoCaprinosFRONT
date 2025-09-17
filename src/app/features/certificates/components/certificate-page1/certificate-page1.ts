import { LucideAngularModule } from 'lucide-angular';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
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
export class CertificatePage1 implements OnChanges, AfterViewInit {
  @Input() certificateData!: CertificateDto;
  @Output() dataLoaded = new EventEmitter<void>();

  private isViewInit = false;
  private hasData = false;

  ngAfterViewInit(): void {
    this.isViewInit = true;
    this.checkAndEmitDataLoaded();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['certificateData']) {
      if (this.certificateData && Object.keys(this.certificateData).length > 0) {
        this.hasData = true;
        this.checkAndEmitDataLoaded();
      } else {
        // Resetear cuando se limpian los datos
        this.hasData = false;
      }
    }
  }

  private checkAndEmitDataLoaded(): void {
    // Emitir evento solo cuando la vista esté inicializada Y tengamos datos
    if (this.isViewInit && this.hasData) {
      // Usar setTimeout para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        this.dataLoaded.emit();
      }, 100);
    }
  }

  // Helper para obtener el mes en español
  getMonthName(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { month: 'long' });
  }
}
