import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { AnimalsService, AnimalQueryParams } from './animals-service';
import { AuthService } from '@features/auth/services/auth.service';
import { environment } from '@environments/environment';
import { AnimalDto } from '@features/animals/models/DTOs/animal';

// Mock AuthService
const mockAuthService = {
  user: signal({ id: 1, name: 'Test', email: 'test@test.com', perfil_id: 1 })
};

describe('AnimalsService', () => {
  let service: AnimalsService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AnimalsService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
    service = TestBed.inject(AnimalsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('CRUD Operations', () => {
    it('should GET animals with query params', () => {
      const params: AnimalQueryParams = { page: 1, per_page: 10, cod_finca: '1' };
      const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0 } };

      service.getAnimals$(params).subscribe(data => {
        expect(data.total).toBe(0);
      });

      const req = httpMock.expectOne(r => r.url.includes('/animals'));
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET single animal by id', () => {
      const mockAnimal: Partial<AnimalDto> = {
        cod_animal: '1',
        nomb_animal: 'TEST-001',
        sexo_animal: 'M'
      };
      const mockResponse = { status: 'success', message: 'OK', data: mockAnimal };

      service.getAnimalById$('1', 1).subscribe((animal: any) => {
        expect(animal.nomb_animal).toBe('TEST-001');
      });

      const req = httpMock.expectOne(r => r.url.includes('/animals'));
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should POST new animal', () => {
      const newAnimal = { nomb_animal: 'NEW-001', cod_sexo: 'M' };
      const mockResponse = { status: 'success', message: 'Created', data: { cod_animal: 1, ...newAnimal } };

      service.addAnimal$(newAnimal as any).subscribe((animal: any) => {
        expect(animal.nomb_animal).toBe('NEW-001');
      });

      const req = httpMock.expectOne(r => r.url.includes('/animals'));
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should PUT update animal', () => {
      const update = { nomb_animal: 'UPDATED-001' };
      const mockResponse = { status: 'success', message: 'Updated', data: { cod_animal: 1, ...update } };

      service.updateAnimal$('1', '1', update as any).subscribe((animal: any) => {
        expect(animal.nomb_animal).toBe('UPDATED-001');
      });

      const req = httpMock.expectOne(r => r.url.includes('/animals'));
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should DELETE animal', () => {
      const mockResponse = { status: 'success', message: 'Deleted', data: null };

      service.deleteAnimal$('1', '1').subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(r => r.url.includes('/animals'));
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
