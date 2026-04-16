import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatingSeason } from './mating-season';
import { ReproductionService } from '../../services/reproduction.service';
import { FarmContextService } from '@core/services/farm-context.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('MatingSeason', () => {
  let component: MatingSeason;
  let fixture: ComponentFixture<MatingSeason>;
  let reproductionService: jasmine.SpyObj<ReproductionService>;

  beforeEach(async () => {
    reproductionService = jasmine.createSpyObj('ReproductionService', [
      'getBreedingSeasons', 'getActiveMatingSeasons', 'createBreedingSeasons', 'updateBreedingSeason'
    ]);
    reproductionService.getBreedingSeasons.and.returnValue(of({ data: { data: [], total: 0 } } as any));
    reproductionService.getActiveMatingSeasons.and.returnValue(of({ data: [] } as any));

    const farmContextService = {
      getSelectedFarm: jasmine.createSpy('getSelectedFarm').and.returnValue(1),
      farmId: signal(1)
    };

    await TestBed.configureTestingModule({
      imports: [MatingSeason, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReproductionService, useValue: reproductionService },
        { provide: FarmContextService, useValue: farmContextService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatingSeason);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
