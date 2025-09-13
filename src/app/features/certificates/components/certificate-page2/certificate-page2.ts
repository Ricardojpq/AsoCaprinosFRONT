import { Component, Input } from '@angular/core';
import { CertificateDto } from '@features/certificates/models/certificate.dto';

@Component({
  selector: 'app-certificate-page2',
  imports: [],
  templateUrl: './certificate-page2.html',
  styleUrl: './certificate-page2.css'
})
export class CertificatePage2 {
  @Input() certificateData!: CertificateDto;
}
