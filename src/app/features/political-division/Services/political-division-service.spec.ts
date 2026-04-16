import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PoliticalDivisionService } from './political-division-service';
import { environment } from '../../../../environments/environment';

describe('PoliticalDivisionService', () => {
  let service: PoliticalDivisionService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/political-division`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PoliticalDivisionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Countries', () => {
    it('should GET countries', () => {
      const mockResponse = { status: 'success', message: 'OK', data: { data: [] } };
      service.getCountries().subscribe(() => {});
      const req = httpMock.expectOne(`${apiUrl}/paises`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET country by id', () => {
      const mockResponse = { status: 'success', message: 'OK', data: { cod_pais: 1, nomb_pais: 'Test' } };
      service.getCountry(1).subscribe((c: any) => expect(c.nomb_pais).toBe('Test'));
      httpMock.expectOne(`${apiUrl}/paises/1`).flush(mockResponse);
    });
  });

  describe('States', () => {
    it('should GET states by country', () => {
      const mockResponse = { status: 'success', message: 'OK', data: [] };
      service.getStatesByCountry(1).subscribe(() => {});
      httpMock.expectOne(`${apiUrl}/estados/pais/1`).flush(mockResponse);
    });
  });

  describe('Municipalities', () => {
    it('should GET municipalities by state', () => {
      const mockResponse = { status: 'success', message: 'OK', data: [] };
      service.getMunicipalitiesByState(1).subscribe(() => {});
      httpMock.expectOne(`${apiUrl}/municipios/estado/1`).flush(mockResponse);
    });
  });

  describe('Parishes', () => {
    it('should GET parishes by municipality', () => {
      const mockResponse = { status: 'success', message: 'OK', data: [] };
      service.getParishesByMunicipality(1).subscribe(() => {});
      httpMock.expectOne(`${apiUrl}/parroquias/municipio/1`).flush(mockResponse);
    });
  });

  describe('Cities', () => {
    it('should GET cities by municipality', () => {
      const mockResponse = { status: 'success', message: 'OK', data: [] };
      service.getCitiesByMunicipality('Test').subscribe(() => {});
      httpMock.expectOne(r => r.url.includes('/ciudades')).flush(mockResponse);
    });
  });
});
