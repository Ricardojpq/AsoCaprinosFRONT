import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Farms } from './farms';
import { FarmsService } from './Services/farms-service';
import { PoliticalDivisionService } from '../political-division/Services/political-division-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('Farms', () => {
  let component: Farms;
  let fixture: ComponentFixture<Farms>;
  let farmsService: jasmine.SpyObj<FarmsService>;
  let politicalDivisionService: jasmine.SpyObj<PoliticalDivisionService>;

  beforeEach(async () => {
    farmsService = jasmine.createSpyObj('FarmsService', [
      'getFarms$', 'getFarm$', 'createFarm$', 'updateFarm$', 'deleteFarm$', 'searchFarms$', 'getStatusOptions'
    ]);
    farmsService.getFarms$.and.returnValue(of({ data: [], total: 0 } as any));
    farmsService.searchFarms$.and.returnValue(of({ data: [], total: 0 } as any));
    farmsService.getStatusOptions.and.returnValue([]);

    politicalDivisionService = jasmine.createSpyObj('PoliticalDivisionService', [
      'getAllCountries', 'getStatesByCountry', 'getMunicipalitiesByState', 'getParishesByMunicipality', 'getCitiesByMunicipality'
    ]);
    politicalDivisionService.getAllCountries.and.returnValue(of({ data: [] } as any));

    await TestBed.configureTestingModule({
      imports: [Farms, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FarmsService, useValue: farmsService },
        { provide: PoliticalDivisionService, useValue: politicalDivisionService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Farms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load farms on init', () => {
    expect(farmsService.getFarms$).toHaveBeenCalled();
  });

  it('should open new farm dialog', () => {
    component.openNew();
    expect(component.fincaDialog).toBeTrue();
    expect(component.submitted).toBeFalse();
  });

  it('should hide dialog', () => {
    component.fincaDialog = true;
    component.hideDialog();
    expect(component.fincaDialog).toBeFalse();
  });
});
