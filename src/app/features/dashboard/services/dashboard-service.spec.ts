import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './dashboard-service';
import { environment } from '../../../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/v1`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET dashboard stats', () => {
    const mockResponse = { status: 'success', message: 'OK', data: { totalAnimals: 100 } };
    service.getDashboardStats().subscribe((s: any) => {
      expect(s).toBeDefined();
    });
    httpMock.expectOne(r => r.url.includes('/animals/stats')).flush(mockResponse);
  });
});
