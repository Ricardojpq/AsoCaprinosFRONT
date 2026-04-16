/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { JwtAuthService } from '@core/services/jwt-auth.service';
import { FarmContextService } from '@core/services/farm-context.service';
import { LoadingService } from '@core/services/loading.service';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let jwtAuthServiceMock: jasmine.SpyObj<JwtAuthService>;
  let farmContextMock: {
    clear: jasmine.Spy;
    setSelectedFarm: jasmine.Spy;
    getSelectedFarm: jasmine.Spy;
  };
  let loadingServiceMock: jasmine.SpyObj<LoadingService>;
  let routerMock: jasmine.SpyObj<Router>;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject<any>(null);
    
    jwtAuthServiceMock = jasmine.createSpyObj('JwtAuthService', [
      'login', 
      'logout', 
      'isAuthenticated',
      'loadUserProfileIfNeeded'
    ], {
      currentUser$: currentUserSubject.asObservable()
    });
    jwtAuthServiceMock.isAuthenticated.and.returnValue(false);

    farmContextMock = {
      clear: jasmine.createSpy('clear'),
      setSelectedFarm: jasmine.createSpy('setSelectedFarm'),
      getSelectedFarm: jasmine.createSpy('getSelectedFarm').and.returnValue(null)
    };

    loadingServiceMock = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    routerMock.navigate.and.returnValue(Promise.resolve(true));
    Object.defineProperty(routerMock, 'url', { value: '/Dashboard', writable: true });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: JwtAuthService, useValue: jwtAuthServiceMock },
        { provide: FarmContextService, useValue: farmContextMock },
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should have user as null initially', () => {
      expect(service.user()).toBeNull();
    });

    it('should have isAuthenticated as false initially', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should have error as null initially', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('login', () => {
    it('should show loading on login', () => {
      jwtAuthServiceMock.login.and.returnValue(of({ status: 'error', message: 'test', data: {} as any }));
      
      service.login('test@test.com', 'password');
      
      expect(loadingServiceMock.show).toHaveBeenCalled();
    });

    it('should navigate to Dashboard on successful login', (done) => {
      const mockResponse = {
        status: 'success',
        message: 'Login successful',
        data: { 
          user: { id: 1, name: 'Test', email: 'test@test.com', perfil_id: 1 },
          access_token: 'token',
          token_type: 'Bearer',
          expires_in: 3600,
          expires_at: new Date().toISOString()
        }
      };
      jwtAuthServiceMock.login.and.returnValue(of(mockResponse));
      
      service.login('test@test.com', 'password');
      
      setTimeout(() => {
        expect(routerMock.navigate).toHaveBeenCalledWith(['/Dashboard']);
        done();
      }, 0);
    });

    it('should update user signal on successful login', (done) => {
      const mockUser = { id: 1, name: 'Test', email: 'test@test.com', perfil_id: 1 };
      const mockResponse = {
        status: 'success',
        message: 'Login successful',
        data: { 
          user: mockUser,
          access_token: 'token',
          token_type: 'Bearer',
          expires_in: 3600,
          expires_at: new Date().toISOString()
        }
      };
      jwtAuthServiceMock.login.and.returnValue(of(mockResponse));
      
      service.login('test@test.com', 'password');
      
      setTimeout(() => {
        const user = service.user();
        expect(user).not.toBeNull();
        expect(user?.id).toEqual(1);
        expect(service.isAuthenticated()).toBeTrue();
        done();
      }, 0);
    });
  });

  describe('logout', () => {
    it('should clear loading and navigate to login', () => {
      service.logout();
      
      expect(loadingServiceMock.show).toHaveBeenCalled();
      expect(jwtAuthServiceMock.logout).toHaveBeenCalled();
      expect(farmContextMock.clear).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/Auth/Login']);
    });

    it('should clear session on logout', () => {
      service.logout();
      
      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.error()).toBeNull();
    });
  });

  describe('Signals', () => {
    it('should return user signal', () => {
      const userSignal = service.user;
      expect(userSignal).toBeDefined();
    });

    it('should return isAuthenticated signal', () => {
      const authSignal = service.isAuthenticated;
      expect(authSignal).toBeDefined();
    });

    it('should return error signal', () => {
      const errorSignal = service.error;
      expect(errorSignal).toBeDefined();
    });
  });

  describe('validateSession', () => {
    it('should return true when authenticated', async () => {
      jwtAuthServiceMock.isAuthenticated.and.returnValue(true);
      
      const result = await service.validateSession();
      
      expect(result).toBeTrue();
    });

    it('should return false when not authenticated', async () => {
      jwtAuthServiceMock.isAuthenticated.and.returnValue(false);
      
      const result = await service.validateSession();
      
      expect(result).toBeFalse();
    });
  });

  describe('isAuthenticatedSync', () => {
    it('should return current authentication state', () => {
      expect(service.isAuthenticatedSync()).toBeFalse();
    });
  });
});
