import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AccountService, UpdateProfileRequest, ChangePasswordRequest } from './account.service';
import { environment } from '../../../../environments/environment';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateProfile', () => {
    it('should PUT to /auth/profile', () => {
      const profileData: UpdateProfileRequest = { name: 'Test', email: 'test@test.com' };
      const mockResponse = { status: 'success', message: 'Updated', data: {} };

      service.updateProfile(profileData).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(profileData);
      req.flush(mockResponse);
    });
  });

  describe('changePassword', () => {
    it('should PUT to /auth/change-password', () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'old',
        newPassword: 'new123',
        confirmPassword: 'new123'
      };
      const mockResponse = { status: 'success', message: 'Password changed', data: {} };

      service.changePassword(passwordData).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/change-password`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(passwordData);
      req.flush(mockResponse);
    });
  });

  describe('getSecuritySettings', () => {
    it('should GET from /auth/security-settings', () => {
      const mockResponse = { status: 'success', message: 'OK', data: {} };

      service.getSecuritySettings().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/security-settings`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateSecuritySettings', () => {
    it('should PUT to /auth/security-settings', () => {
      const settings = { twoFactor: true };
      const mockResponse = { status: 'success', message: 'Updated', data: {} };

      service.updateSecuritySettings(settings).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/security-settings`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(settings);
      req.flush(mockResponse);
    });
  });
});
