import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogsService, CatalogQueryParams } from './catalogs-service';
import { environment } from '../../../../../environments/environment';
import {
  ColorDto,
  RazaDto,
  CondicionCorporalDto,
  TipoPeloDto
} from '../../../../core/models/DTOs';

describe('CatalogsService', () => {
  let service: CatalogsService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/v1`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CatalogsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============= COLORS =============
  describe('Colors', () => {
    it('should GET colors with query params', () => {
      const params: CatalogQueryParams = { page: 1, per_page: 10 };
      const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0, current_page: 1 } };

      service.getColors$(params).subscribe(data => {
        expect(data.current_page).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/color?page=1&per_page=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET single color', () => {
      const mockColor: ColorDto = { 
        cod_color: 1, 
        nomb_color: 'Test', 
        is_active: 1,
        created_by: 1,
        is_deleted: 0,
        created_at: '2024-01-01'
      };
      const mockResponse = { status: 'success', message: 'OK', data: mockColor };

      service.getColor$(1).subscribe(color => {
        expect(color.nomb_color).toBe('Test');
      });

      const req = httpMock.expectOne(`${apiUrl}/color/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should POST new color', () => {
      const newColor = { nomb_color: 'New' };
      const createdColor: ColorDto = {
        cod_color: 1,
        nomb_color: 'New',
        is_active: 1,
        created_by: 1,
        is_deleted: 0,
        created_at: '2024-01-01'
      };
      const mockResponse = { status: 'success', message: 'Created', data: createdColor };

      service.createColor$(newColor as any).subscribe(color => {
        expect(color.nomb_color).toBe('New');
      });

      const req = httpMock.expectOne(`${apiUrl}/color`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newColor);
      req.flush(mockResponse);
    });

    it('should PUT update color', () => {
      const update = { nomb_color: 'Updated' };
      const updatedColor: ColorDto = {
        cod_color: 1,
        nomb_color: 'Updated',
        is_active: 1,
        created_by: 1,
        is_deleted: 0,
        created_at: '2024-01-01'
      };
      const mockResponse = { status: 'success', message: 'Updated', data: updatedColor };

      service.updateColor$(1, update as any).subscribe(color => {
        expect(color.nomb_color).toBe('Updated');
      });

      const req = httpMock.expectOne(`${apiUrl}/color/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should DELETE color', () => {
      const mockResponse = { status: 'success', message: 'Deleted', data: null };

      service.deleteColor$(1).subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/color/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  // ============= BREEDS =============
  describe('Breeds', () => {
    it('should GET breeds', () => {
      const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0 } };

      service.getBreeds$().subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/raza`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET single breed', () => {
      const mockBreed: RazaDto = { 
        cod_raza: 1, 
        descripcion: 'Test',
        is_active: 1,
        created_by: 1,
        is_deleted: 0,
        created_at: '2024-01-01'
      };
      const mockResponse = { status: 'success', message: 'OK', data: mockBreed };

      service.getBreed$(1).subscribe(breed => {
        expect(breed.descripcion).toBe('Test');
      });

      httpMock.expectOne(`${apiUrl}/raza/1`).flush(mockResponse);
    });

    it('should POST new breed', () => {
      const newBreed = { descripcion: 'New', estatus: 'A' };
      const mockResponse = { status: 'success', message: 'Created', data: { cod_raza: 1, ...newBreed } };

      service.createBreed$(newBreed as any).subscribe(breed => {
        expect(breed.descripcion).toBe('New');
      });

      const req = httpMock.expectOne(`${apiUrl}/raza`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  // ============= BODY CONDITIONS =============
  describe('Body Conditions', () => {
    it('should GET body conditions', () => {
      const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0 } };

      service.getBodyConditions$().subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/condicion-corporal`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should create body condition', () => {
      const newCondition = { descripcion: 'Good', estatus: 'A' };
      const mockResponse = { status: 'success', message: 'Created', data: { cod_condicion: 1, ...newCondition } };

      service.createBodyCondition$(newCondition as any).subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/condicion-corporal`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should delete body condition', () => {
      const mockResponse = { status: 'success', message: 'Deleted', data: null };

      service.deleteBodyCondition$(1).subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/condicion-corporal/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  // ============= HAIR TYPES =============
  describe('Hair Types', () => {
    it('should GET hair types', () => {
      const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0 } };

      service.getHairTypes$().subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/tipo-pelo`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET single hair type', () => {
      const mockHairType: TipoPeloDto = { 
        cod_tipo_pelo: 1, 
        nomb_tipo_pelo: 'Long',
        is_active: 1,
        created_by: 1,
        is_deleted: 0,
        created_at: '2024-01-01'
      };
      const mockResponse = { status: 'success', message: 'OK', data: mockHairType };

      service.getHairType$(1).subscribe(hairType => {
        expect(hairType.nomb_tipo_pelo).toBe('Long');
      });

      httpMock.expectOne(`${apiUrl}/tipo-pelo/1`).flush(mockResponse);
    });

    it('should update hair type', () => {
      const update = { nomb_tipo_pelo: 'Short' };
      const updatedHairType: TipoPeloDto = {
        cod_tipo_pelo: 1,
        nomb_tipo_pelo: 'Short',
        is_active: 1,
        created_by: 1,
        is_deleted: 0,
        created_at: '2024-01-01'
      };
      const mockResponse = { status: 'success', message: 'Updated', data: updatedHairType };

      service.updateHairType$(1, update as any).subscribe(hairType => {
        expect(hairType.nomb_tipo_pelo).toBe('Short');
      });

      const req = httpMock.expectOne(`${apiUrl}/tipo-pelo/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  // ============= UTILITY METHODS =============
  describe('Utility Methods', () => {
    it('should getAllColors return array', () => {
      const mockResponse = { status: 'success', message: 'OK', data: { data: [{ cod_color: 1, des_color: 'Red' }], total: 1 } };

      service.getAllColors$().subscribe(colors => {
        expect(colors.length).toBe(1);
      });

      httpMock.expectOne(`${apiUrl}/color?per_page=100`).flush(mockResponse);
    });

    it('should getAllBreeds return array', () => {
      const mockResponse = { status: 'success', message: 'OK', data: { data: [{ cod_raza: 1, descripcion: 'Angus' }], total: 1 } };

      service.getAllBreeds$().subscribe(breeds => {
        expect(breeds.length).toBe(1);
      });

      httpMock.expectOne(`${apiUrl}/raza?per_page=100`).flush(mockResponse);
    });
  });
});
