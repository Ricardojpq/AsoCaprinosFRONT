import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ParishesTabComponent } from './parishes-tab.component';
import { PoliticalDivisionService } from '../../Services/political-division-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('ParishesTabComponent', () => {
  let component: ParishesTabComponent;
  let fixture: ComponentFixture<ParishesTabComponent>;
  let politicalDivisionService: jasmine.SpyObj<PoliticalDivisionService>;

  beforeEach(async () => {
    politicalDivisionService = jasmine.createSpyObj('PoliticalDivisionService', [
      'getStatesByCountry', 'getMunicipalitiesByState', 'getParishes', 'createParish', 'updateParish', 'deleteParish'
    ]);
    politicalDivisionService.getStatesByCountry.and.returnValue(of({ data: [] } as any));
    politicalDivisionService.getMunicipalitiesByState.and.returnValue(of({ data: [] } as any));
    politicalDivisionService.getParishes.and.returnValue(of({ data: { data: [], total: 0 } } as any));

    await TestBed.configureTestingModule({
      imports: [ParishesTabComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PoliticalDivisionService, useValue: politicalDivisionService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ParishesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
