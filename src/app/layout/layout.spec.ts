import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Layout } from './layout';
import { LayoutService } from '@layout/services/layout-service';
import { AuthService } from '@features/auth/services/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { signal } from '@angular/core';

const mockRouter = {
  events: new Subject(),
  url: '/dashboard'
};

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
  isAuthenticated: signal(false)
};

describe('Layout', () => {
  let component: Layout;
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
