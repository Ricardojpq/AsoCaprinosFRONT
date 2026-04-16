import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Account } from './account';
import { Router } from '@angular/router';
import { AuthService } from '@features/auth/services/auth.service';
import { signal } from '@angular/core';

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
  url: '/account/general'
};

const mockAuthService = {
  user: signal(null),
  isAuthenticated: signal(false)
};

describe('Account', () => {
  let component: Account;
  let fixture: ComponentFixture<Account>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Account],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Account);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
