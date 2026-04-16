import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Lactation } from './lactation';
import { ReproductionService } from '../../services/reproduction.service';
import { FarmContextService } from '@core/services/farm-context.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('Lactation', () => {
  let component: Lactation;
  let fixture: ComponentFixture<Lactation>;
  let reproductionService: jasmine.SpyObj<ReproductionService>;

  beforeEach(async () => {
    reproductionService = jasmine.createSpyObj('ReproductionService', [
      'getLactationControls', 'getLactationStats', 'getNursingOffspring'
    ]);
    reproductionService.getLactationControls.and.returnValue(of({ data: { data: [], total: 0 } } as any));
    reproductionService.getLactationStats.and.returnValue(of({ data: {} } as any));

    const farmContextService = {
      getSelectedFarm: jasmine.createSpy('getSelectedFarm').and.returnValue(1),
      farmId: signal(1)
    };

    await TestBed.configureTestingModule({
      imports: [Lactation, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReproductionService, useValue: reproductionService },
        { provide: FarmContextService, useValue: farmContextService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Lactation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
