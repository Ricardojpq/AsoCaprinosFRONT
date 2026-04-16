import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DiagnosticoPrenezComponent } from './pregnancy-diagnosis';
import { ReproductionService } from '../../services/reproduction.service';
import { FarmContextService } from '@core/services/farm-context.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('DiagnosticoPrenezComponent', () => {
  let component: DiagnosticoPrenezComponent;
  let fixture: ComponentFixture<DiagnosticoPrenezComponent>;
  let reproductionService: jasmine.SpyObj<ReproductionService>;

  beforeEach(async () => {
    reproductionService = jasmine.createSpyObj('ReproductionService', [
      'getFemalesForDiagnosis', 'createPregnancyDiagnosis'
    ]);
    reproductionService.getFemalesForDiagnosis.and.returnValue(of({ data: { hembras: [], diasEspera: 30 } } as any));

    const farmContextService = {
      getSelectedFarm: jasmine.createSpy('getSelectedFarm').and.returnValue(1),
      farmId: signal(1)
    };

    await TestBed.configureTestingModule({
      imports: [DiagnosticoPrenezComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReproductionService, useValue: reproductionService },
        { provide: FarmContextService, useValue: farmContextService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DiagnosticoPrenezComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
