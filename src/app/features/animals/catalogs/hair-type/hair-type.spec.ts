import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HairType } from './hair-type';
import { CatalogsService } from '../services/catalogs-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('HairType', () => {
  let component: HairType;
  let fixture: ComponentFixture<HairType>;
  let catalogsService: jasmine.SpyObj<CatalogsService>;

  beforeEach(async () => {
    catalogsService = jasmine.createSpyObj('CatalogsService', ['getHairTypes$', 'createHairType$', 'updateHairType$', 'deleteHairType$']);
    catalogsService.getHairTypes$.and.returnValue(of({ data: [], total: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [HairType, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CatalogsService, useValue: catalogsService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HairType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load hair types on init', () => {
    expect(catalogsService.getHairTypes$).toHaveBeenCalled();
  });
});
