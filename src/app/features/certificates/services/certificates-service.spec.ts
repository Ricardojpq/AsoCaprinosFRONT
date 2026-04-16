import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CertificatesService } from './certificates-service';
import { environment } from '../../../../environments/environment';

describe('CertificatesService', () => {
  let service: CertificatesService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/v1/certificates`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CertificatesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET certificates', () => {
    const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0 } };
    service.getCertificates(1, 10).subscribe(() => {});
    const req = httpMock.expectOne(r => r.url.includes('/certificates'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should GET certificate by id', () => {
    const mockResponse = { status: 'success', message: 'OK', data: { id: 1, num_certificado: 'CERT-001' } };
    service.getCertificateById(1).subscribe((c: any) => {
      expect(c.num_certificado).toBe('CERT-001');
    });
    httpMock.expectOne(`${apiUrl}/1`).flush(mockResponse);
  });

  it('should POST new certificate', () => {
    const newCert = { cod_animal: '1', tipo_registro: 'I' };
    const mockResponse = { status: 'success', message: 'Created', data: { id: 1, ...newCert } };
    service.createCertificate(newCert as any).subscribe((c: any) => {
      expect(c.tipo_registro).toBe('I');
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should PUT update certificate', () => {
    const update = { cod_animal: '1', cod_finca: '1' };
    const mockResponse = { status: 'success', message: 'Updated', data: { id: 1, ...update } };
    service.updateCertificate(1, update).subscribe((c: any) => {
      expect(c.cod_animal).toBe('1');
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should DELETE certificate', () => {
    const mockResponse = { status: 'success', message: 'Deleted', data: null };
    service.deleteCertificate(1).subscribe(() => {
      expect(true).toBeTrue();
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
