import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PerfilesService } from './perfiles.service';
import { environment } from '../../../../environments/environment';

describe('PerfilesService', () => {
  let service: PerfilesService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/v1/perfiles`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PerfilesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET perfiles', () => {
    const mockResponse = { status: 'success', data: { data: [], total: 0 } };
    service.getPerfiles().subscribe((p: any) => {
      expect(p.data).toEqual([]);
    });
    const req = httpMock.expectOne(r => r.url.includes('/perfiles'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should GET perfil by id', () => {
    const mockResponse = { status: 'success', data: { id_perfil: 1, descripcion: 'Admin' } };
    service.getPerfil(1).subscribe((p: any) => {
      expect(p.descripcion).toBe('Admin');
    });
    httpMock.expectOne(`${apiUrl}/1`).flush(mockResponse);
  });

  it('should POST new perfil', () => {
    const mockResponse = { status: 'success', data: { id_perfil: 1, descripcion: 'New' } };
    service.createPerfil('New').subscribe((p: any) => {
      expect(p.descripcion).toBe('New');
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should PUT update perfil', () => {
    const mockResponse = { status: 'success', data: { id_perfil: 1, descripcion: 'Updated' } };
    service.updatePerfil(1, 'Updated').subscribe((p: any) => {
      expect(p.descripcion).toBe('Updated');
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should DELETE perfil', () => {
    const mockResponse = { status: 'success' };
    service.deletePerfil(1).subscribe(() => {
      expect(true).toBeTrue();
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
