import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CitiesTabComponent } from './cities-tab.component';
import { PoliticalDivisionService } from '../../Services/political-division-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('CitiesTabComponent', () => {
  let component: CitiesTabComponent;
  let fixture: ComponentFixture<CitiesTabComponent>;
  let politicalDivisionService: jasmine.SpyObj<PoliticalDivisionService>;

  beforeEach(async () => {
    politicalDivisionService = jasmine.createSpyObj('PoliticalDivisionService', [
      'getStatesByCountry', 'getMunicipalitiesByState', 'getCitiesByMunicipality', 'createCity', 'updateCity', 'deleteCity'
    ]);
    politicalDivisionService.getStatesByCountry.and.returnValue(of({ data: [] } as any));
    politicalDivisionService.getMunicipalitiesByState.and.returnValue(of({ data: [] } as any));
    politicalDivisionService.getCitiesByMunicipality.and.returnValue(of({ data: [] } as any));

    await TestBed.configureTestingModule({
      imports: [CitiesTabComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PoliticalDivisionService, useValue: politicalDivisionService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CitiesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
