import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EstadosReproductivosComponent } from './reproductive-status';
import { ReproductionService } from '../../services/reproduction.service';
import { FarmContextService } from '@core/services/farm-context.service';
import { MessageService } from 'primeng/api';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('EstadosReproductivosComponent', () => {
  let component: EstadosReproductivosComponent;
  let fixture: ComponentFixture<EstadosReproductivosComponent>;
  let reproductionService: jasmine.SpyObj<ReproductionService>;

  beforeEach(async () => {
    reproductionService = jasmine.createSpyObj('ReproductionService', [
      'getBreedingMales', 'getAvailableFemales', 'getBirthStatistics'
    ]);
    reproductionService.getBreedingMales.and.returnValue(of({ data: [] } as any));
    reproductionService.getAvailableFemales.and.returnValue(of({ data: [] } as any));

    const farmContextService = {
      getSelectedFarm: jasmine.createSpy('getSelectedFarm').and.returnValue(1),
      farmId: signal(1)
    };

    await TestBed.configureTestingModule({
      imports: [EstadosReproductivosComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReproductionService, useValue: reproductionService },
        { provide: FarmContextService, useValue: farmContextService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EstadosReproductivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
