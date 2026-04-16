import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Companies } from './companies';
import { CompaniesService } from './Services/companies-service';
import { PoliticalDivisionService } from '../political-division/Services/political-division-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('Companies', () => {
  let component: Companies;
  let fixture: ComponentFixture<Companies>;
  let companiesService: jasmine.SpyObj<CompaniesService>;

  beforeEach(async () => {
    companiesService = jasmine.createSpyObj('CompaniesService', [
      'getEmpresas', 'getEmpresa', 'createEmpresa', 'updateEmpresa', 'deleteEmpresa'
    ]);
    companiesService.getEmpresas.and.returnValue(of({ data: { data: [], total: 0 } } as any));

    await TestBed.configureTestingModule({
      imports: [Companies, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CompaniesService, useValue: companiesService },
        { provide: PoliticalDivisionService, useValue: jasmine.createSpyObj('PoliticalDivisionService', ['getAllCountries']) },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Companies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
