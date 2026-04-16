import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AnimalStatus } from './animal-status';
import { AnimalStatusService } from '@core/services/animal-status.service';
import { FarmContextService } from '@core/services/farm-context.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('AnimalStatus', () => {
  let component: AnimalStatus;
  let fixture: ComponentFixture<AnimalStatus>;
  let animalStatusService: jasmine.SpyObj<AnimalStatusService>;

  beforeEach(async () => {
    animalStatusService = jasmine.createSpyObj('AnimalStatusService', [
      'getAnimalStatuses', 'createAnimalStatus', 'updateAnimalStatus'
    ]);
    animalStatusService.getAnimalStatuses.and.returnValue(of({ data: [] } as any));

    const farmContextService = {
      getSelectedFarm: jasmine.createSpy('getSelectedFarm').and.returnValue(1),
      farmId: signal(1)
    };

    await TestBed.configureTestingModule({
      imports: [AnimalStatus, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AnimalStatusService, useValue: animalStatusService },
        { provide: FarmContextService, useValue: farmContextService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
