import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Sidebar } from './sidebar';
import { LayoutService } from '@layout/services/layout-service';
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

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
