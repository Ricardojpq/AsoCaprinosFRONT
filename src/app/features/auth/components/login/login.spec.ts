import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Login } from './login';
import { AuthService } from '@features/auth/services/auth.service';
import { LoadingService } from '@core/services/loading.service';
import { signal } from '@angular/core';

// Mock services
const mockAuthService = {
  login: jasmine.createSpy('login'),
  user: signal(null),
  isAuthenticated: signal(false),
  error: signal(null)
};

const mockLoadingService = {
  loading: signal(false)
};

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('should require email and password', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');
    
    emailControl?.setValue('');
    passwordControl?.setValue('');
    
    expect(emailControl?.valid).toBeFalse();
    expect(passwordControl?.valid).toBeFalse();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalse();
    
    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('should call authService.login on form submit', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    
    component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
