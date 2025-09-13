import {
  Component,
  Input,
  OnInit
} from '@angular/core';

import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-certificate-viewer',
  imports: [],
  templateUrl: './certificate-viewer.html',
  styleUrl: './certificate-viewer.css',
})
export class CertificateViewer implements OnInit {
  @Input() pdfUrl: SafeResourceUrl | null = null;
  @Input() isLoading = false;
  @Input() error: string | null = null;

  constructor() {}

  ngOnInit(): void {
    // Inicializar el componente
  }

}
