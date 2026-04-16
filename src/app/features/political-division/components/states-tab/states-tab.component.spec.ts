import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StatesTabComponent } from './states-tab.component';
import { PoliticalDivisionService } from '../../Services/political-division-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('StatesTabComponent', () => {
  let component: StatesTabComponent;
  let fixture: ComponentFixture<StatesTabComponent>;
  let politicalDivisionService: jasmine.SpyObj<PoliticalDivisionService>;

  beforeEach(async () => {
    politicalDivisionService = jasmine.createSpyObj('PoliticalDivisionService', [
      'getCountries', 'getStatesByCountry', 'createState', 'updateState', 'deleteState'
    ]);
    politicalDivisionService.getCountries.and.returnValue(of({ data: { data: [] } } as any));
    politicalDivisionService.getStatesByCountry.and.returnValue(of({ data: [] } as any));

    await TestBed.configureTestingModule({
      imports: [StatesTabComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PoliticalDivisionService, useValue: politicalDivisionService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StatesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
