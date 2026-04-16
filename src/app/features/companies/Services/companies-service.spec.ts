import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CompaniesService } from './companies-service';
import { environment } from '../../../../environments/environment';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/empresa`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CompaniesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET empresas', () => {
    const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0 } };

    service.getEmpresas({}).subscribe(() => {
      expect(true).toBeTrue();
    });

    const req = httpMock.expectOne(r => r.url.includes('/empresa'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should GET empresa by cod', () => {
    const mockResponse = { status: 'success', message: 'OK', data: { cod_empresa: 1, nomb_empresa: 'Test' } };

    service.getEmpresa(1).subscribe((e: any) => {
      expect(e.nomb_empresa).toBe('Test');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should POST new empresa', () => {
    const newEmpresa = { nomb_empresa: 'New', rif: 'J-123456' };
    const mockResponse = { status: 'success', message: 'Created', data: { cod_empresa: 1, ...newEmpresa } };

    service.createEmpresa(newEmpresa as any).subscribe((e: any) => {
      expect(e.nomb_empresa).toBe('New');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should PUT update empresa', () => {
    const update = { nomb_empresa: 'Updated' };
    const mockResponse = { status: 'success', message: 'Updated', data: { cod_empresa: 1, ...update } };

    service.updateEmpresa(1, update as any).subscribe((e: any) => {
      expect(e.nomb_empresa).toBe('Updated');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should DELETE empresa', () => {
    service.deleteEmpresa(1).subscribe(() => {
      expect(true).toBeTrue();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
