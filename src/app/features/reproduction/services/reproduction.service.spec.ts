import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReproductionService } from './reproduction.service';
import { environment } from '../../../../environments/environment';

describe('ReproductionService', () => {
  let service: ReproductionService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ReproductionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Breeding Seasons', () => {
    it('should GET breeding seasons', () => {
      const mockResponse = { success: true, message: 'OK', data: { data: [], total: 0 } };
      service.getBreedingSeasons({}).subscribe(() => {});
      httpMock.expectOne(r => r.url.includes('/reproduccion/temporadas-monta')).flush(mockResponse);
    });

    it('should POST new breeding season', () => {
      const mockResponse = { success: true, message: 'Created', data: { id: 1 } };
      service.createBreedingSeasons({ nombre: 'Test' } as any).subscribe(() => {});
      const req = httpMock.expectOne(`${apiUrl}/reproduccion/temporadas-monta`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('Births', () => {
    it('should GET births', () => {
      const mockResponse = { success: true, message: 'OK', data: { data: [], total: 0 } };
      service.getBirths({}).subscribe(() => {});
      httpMock.expectOne(r => r.url.includes('/reproduccion/partos')).flush(mockResponse);
    });

    it('should POST new birth', () => {
      const mockResponse = { success: true, message: 'Created', data: { id: 1 } };
      service.createBirth({} as any).subscribe(() => {});
      const req = httpMock.expectOne(`${apiUrl}/reproduccion/partos`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('Lactation', () => {
    it('should GET lactation controls', () => {
      const mockResponse = { success: true, message: 'OK', data: { data: [], total: 0 } };
      service.getLactationControls({}).subscribe(() => {});
      httpMock.expectOne(r => r.url.includes('/reproduccion/lactancia')).flush(mockResponse);
    });
  });
});
