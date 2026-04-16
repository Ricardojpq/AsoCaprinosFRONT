import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AnimalFormComponent } from './animal-form.component';
import { FarmContextService } from '@core/services/farm-context.service';
import { MessageService } from 'primeng/api';
import { signal } from '@angular/core';

describe('AnimalFormComponent', () => {
  let component: AnimalFormComponent;
  let fixture: ComponentFixture<AnimalFormComponent>;

  beforeEach(async () => {
    const farmContextService = {
      getSelectedFarm: jasmine.createSpy('getSelectedFarm').and.returnValue(1),
      farmId: signal(1)
    };

    await TestBed.configureTestingModule({
      imports: [AnimalFormComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FarmContextService, useValue: farmContextService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
