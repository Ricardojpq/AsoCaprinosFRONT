import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CountriesTabComponent } from './countries-tab.component';
import { PoliticalDivisionService } from '../../Services/political-division-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('CountriesTabComponent', () => {
  let component: CountriesTabComponent;
  let fixture: ComponentFixture<CountriesTabComponent>;
  let politicalDivisionService: jasmine.SpyObj<PoliticalDivisionService>;

  beforeEach(async () => {
    politicalDivisionService = jasmine.createSpyObj('PoliticalDivisionService', [
      'getCountries', 'getCountry', 'createCountry', 'updateCountry', 'deleteCountry'
    ]);
    politicalDivisionService.getCountries.and.returnValue(of({ data: { data: [] } } as any));

    await TestBed.configureTestingModule({
      imports: [CountriesTabComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PoliticalDivisionService, useValue: politicalDivisionService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CountriesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load countries on init', () => {
    expect(politicalDivisionService.getCountries).toHaveBeenCalled();
  });
});
