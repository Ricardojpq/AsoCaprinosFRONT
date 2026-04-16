import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Navbar } from './navbar';
import { LayoutService } from '@layout/services/layout-service';
import { AuthService } from '@features/auth/services/auth.service';
import { Subject } from 'rxjs';
import { signal } from '@angular/core';

const mockLayoutService = {
  layoutConfig: signal({ menuMode: 'static' }),
  layoutState: signal({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    staticMenuMobileActive: false,
    menuHoverActive: false
  }),
  overlayOpen$: new Subject()
};

const mockAuthService = {
  user: signal(null),
  isAuthenticated: signal(false),
  logout: jasmine.createSpy('logout')
};

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
