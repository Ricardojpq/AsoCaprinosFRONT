import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MembersService } from './members-service';
import { environment } from '../../../../environments/environment';

describe('MembersService', () => {
  let service: MembersService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/v1/socios`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MembersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET members', () => {
    const mockResponse = { status: 'success', message: 'OK', data: { data: [], total: 0 } };
    service.getMembers$({}).subscribe(data => {
      expect(data.total).toBe(0);
    });
    const req = httpMock.expectOne(r => r.url.includes('/socios'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should GET member by id', () => {
    const mockResponse = { status: 'success', message: 'OK', data: { ced_socio: '123', nomb_socio: 'Test' } };
    service.getMemberById$('123', 1).subscribe((m: any) => {
      expect(m.nomb_socio).toBe('Test');
    });
    httpMock.expectOne(`${apiUrl}/123/1`).flush(mockResponse);
  });

  it('should PUT update member', () => {
    const update = { nomb_socio: 'Updated' };
    const mockResponse = { status: 'success', message: 'Updated', data: { ced_socio: '123', ...update } };
    service.updateMember$('123', update as any).subscribe((m: any) => {
      expect(m.nomb_socio).toBe('Updated');
    });
    const req = httpMock.expectOne(`${apiUrl}/123/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should DELETE member', () => {
    const mockResponse = { status: 'success', message: 'Deleted', data: null };
    service.deleteMember$('123').subscribe(() => {
      expect(true).toBeTrue();
    });
    const req = httpMock.expectOne(`${apiUrl}/123/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
