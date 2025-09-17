import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';

import { SafeResourceUrl } from '@angular/platform-browser';
import { CertificateDto } from '@features/certificates/models/certificate.dto';
import { CertificatePage1 } from '../certificate-page1/certificate-page1';
import { CertificatePage2 } from '../certificate-page2/certificate-page2';

@Component({
  selector: 'app-certificate-viewer',
  imports: [CertificatePage1, CertificatePage2],
  templateUrl: './certificate-viewer.html',
  styleUrl: './certificate-viewer.css',
})
export class CertificateViewer implements OnInit {
  @Input() pdfUrl: SafeResourceUrl | null = null;
  @Input() isLoading = false;
  @Input() error: string | null = null;
  @Input() certificateData!: CertificateDto;
  @Output() allDataLoaded = new EventEmitter<void>();

  private page1Loaded = false;
  private page2Loaded = false;

  constructor() {}

  ngOnInit(): void {
    // Inicializar el componente
  }

  onPage1DataLoaded(): void {
    this.page1Loaded = true;
    this.checkAllDataLoaded();
  }

  onPage2DataLoaded(): void {
    this.page2Loaded = true;
    this.checkAllDataLoaded();
  }

  private checkAllDataLoaded(): void {
    if (this.page1Loaded && this.page2Loaded) {
      // Emitir evento cuando ambas páginas hayan cargado sus datos
      this.allDataLoaded.emit();
      // Resetear flags para próxima carga
      this.page1Loaded = false;
      this.page2Loaded = false;
    }
  }
}
