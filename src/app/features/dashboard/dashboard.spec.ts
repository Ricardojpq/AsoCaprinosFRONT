import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Dashboard } from './dashboard';
import { DashboardService } from './services/dashboard-service';
import { AnimalsService } from '../animals/services/animals-service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

const mockAuthService = {
  user: signal({ id: 1, name: 'Test', email: 'test@test.com', perfil_id: 1 })
};

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let dashboardService: jasmine.SpyObj<DashboardService>;

  beforeEach(async () => {
    dashboardService = jasmine.createSpyObj('DashboardService', ['getDashboardStats']);
    dashboardService.getDashboardStats.and.returnValue(of({}) as any);

    const animalsService = jasmine.createSpyObj('AnimalsService', ['getAnimalStats$']);
    animalsService.getAnimalStats$.and.returnValue(of({ data: {} }));

    await TestBed.configureTestingModule({
      imports: [Dashboard, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DashboardService, useValue: dashboardService },
        { provide: AnimalsService, useValue: animalsService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
