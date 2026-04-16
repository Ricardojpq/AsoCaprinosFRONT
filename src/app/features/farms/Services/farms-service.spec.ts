import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FarmsService } from './farms-service';
import { environment } from '../../../../environments/environment';
import { FincaDto } from '../models/finca.dto';

describe('FarmsService', () => {
  let service: FarmsService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/v1/fincas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(FarmsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('CRUD Operations', () => {
    it('should GET farms with pagination params', () => {
      const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0, current_page: 1 } };

      service.getFarms$({ page: 1, per_page: 10, search: 'Test' }).subscribe(data => {
        expect(data.current_page).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&per_page=10&search=Test`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET single farm', () => {
      const mockFarm: Partial<FincaDto> = {
        cod_finca: 1,
        nomb_finca: 'Test Farm',
        direccion: 'Test Address',
        cod_empresa: 1,
        estatus_finca: 'A',
        is_active: true,
        created_by: 1,
        is_deleted: false,
        created_at: '2024-01-01'
      };
      const mockResponse = { status: 'success', message: 'OK', data: mockFarm };

      service.getFarm$(1).subscribe(farm => {
        expect(farm.nomb_finca).toBe('Test Farm');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should POST new farm', () => {
      const newFarm = {
        nomb_finca: 'New Farm',
        direccion: 'New Address',
        cod_empresa: 1,
        estatus_finca: 'A'
      };
      const mockResponse = { status: 'success', message: 'Created', data: { cod_finca: 1, ...newFarm } };

      service.createFarm$(newFarm as any).subscribe(farm => {
        expect(farm.nomb_finca).toBe('New Farm');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newFarm);
      req.flush(mockResponse);
    });

    it('should PUT update farm', () => {
      const update = { nomb_finca: 'Updated Farm' };
      const mockResponse = { status: 'success', message: 'Updated', data: { cod_finca: 1, ...update } };

      service.updateFarm$(1, update as any).subscribe(farm => {
        expect(farm.nomb_finca).toBe('Updated Farm');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should DELETE farm', () => {
      const mockResponse = { status: 'success', message: 'Deleted', data: null };

      service.deleteFarm$(1).subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('Search', () => {
    it('should search farms by term', () => {
      const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0 } };

      service.searchFarms$('Test').subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(r => r.url.includes(apiUrl));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('search')).toBe('Test');
      req.flush(mockResponse);
    });
  });
});
