import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MunicipalitiesTabComponent } from './municipalities-tab.component';
import { PoliticalDivisionService } from '../../Services/political-division-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('MunicipalitiesTabComponent', () => {
  let component: MunicipalitiesTabComponent;
  let fixture: ComponentFixture<MunicipalitiesTabComponent>;
  let politicalDivisionService: jasmine.SpyObj<PoliticalDivisionService>;

  beforeEach(async () => {
    politicalDivisionService = jasmine.createSpyObj('PoliticalDivisionService', [
      'getCountries', 'getStatesByCountry', 'getMunicipalities', 'createMunicipality', 'updateMunicipality', 'deleteMunicipality'
    ]);
    politicalDivisionService.getCountries.and.returnValue(of({ data: { data: [] } } as any));
    politicalDivisionService.getStatesByCountry.and.returnValue(of({ data: [] } as any));
    politicalDivisionService.getMunicipalities.and.returnValue(of({ data: { data: [], total: 0 } } as any));

    await TestBed.configureTestingModule({
      imports: [MunicipalitiesTabComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PoliticalDivisionService, useValue: politicalDivisionService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MunicipalitiesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
