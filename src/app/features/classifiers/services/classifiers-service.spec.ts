import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClassifiersService } from './classifiers-service';
import { environment } from '../../../../environments/environment';

describe('ClassifiersService', () => {
  let service: ClassifiersService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ClassifiersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET clasificadores', () => {
    const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0 } };

    service.getClasificadores({}).subscribe(() => {
      expect(true).toBeTrue();
    });

    const req = httpMock.expectOne(r => r.url.includes('/clasificador'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should GET clasificador by ced', () => {
    const mockResponse = { status: 'success', message: 'OK', data: { ced_clasificador: '123', nomb_clasificador: 'Test' } };

    service.getClasificador('123').subscribe((c: any) => {
      expect(c.nomb_clasificador).toBe('Test');
    });

    const req = httpMock.expectOne(`${apiUrl}/clasificador/123`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
