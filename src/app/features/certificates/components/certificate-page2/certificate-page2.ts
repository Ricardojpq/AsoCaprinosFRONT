import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CertificateDto } from '@features/certificates/models/certificate.dto';

@Component({
  selector: 'app-certificate-page2',
  imports: [],
  templateUrl: './certificate-page2.html',
  styleUrl: './certificate-page2.css'
})
export class CertificatePage2 implements OnChanges, AfterViewInit {
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
        console.log(this.certificateData);
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
}
