import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Breeds } from './breeds';
import { CatalogsService } from '../services/catalogs-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('Breeds', () => {
  let component: Breeds;
  let fixture: ComponentFixture<Breeds>;
  let catalogsService: jasmine.SpyObj<CatalogsService>;

  beforeEach(async () => {
    catalogsService = jasmine.createSpyObj('CatalogsService', ['getBreeds$', 'createBreed$', 'updateBreed$', 'deleteBreed$']);
    catalogsService.getBreeds$.and.returnValue(of({ data: [], total: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [Breeds, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CatalogsService, useValue: catalogsService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Breeds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load breeds on init', () => {
    expect(catalogsService.getBreeds$).toHaveBeenCalled();
  });
});
