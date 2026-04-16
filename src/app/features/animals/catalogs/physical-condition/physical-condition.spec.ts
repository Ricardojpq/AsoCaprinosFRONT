import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PhysicalCondition } from './physical-condition';
import { CatalogsService } from '../services/catalogs-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('PhysicalCondition', () => {
  let component: PhysicalCondition;
  let fixture: ComponentFixture<PhysicalCondition>;
  let catalogsService: jasmine.SpyObj<CatalogsService>;

  beforeEach(async () => {
    catalogsService = jasmine.createSpyObj('CatalogsService', ['getBodyConditions$', 'createBodyCondition$', 'updateBodyCondition$', 'deleteBodyCondition$']);
    catalogsService.getBodyConditions$.and.returnValue(of({ data: [], total: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [PhysicalCondition, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CatalogsService, useValue: catalogsService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhysicalCondition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load body conditions on init', () => {
    expect(catalogsService.getBodyConditions$).toHaveBeenCalled();
  });
});
