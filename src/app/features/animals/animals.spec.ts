import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Animals } from './animals';
import { AnimalsService } from './services/animals-service';
import { CatalogsService } from './catalogs/services/catalogs-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

const mockAuthService = {
  user: signal({ id: 1, name: 'Test', email: 'test@test.com', perfil_id: 1 })
};

describe('Animals', () => {
  let component: Animals;
  let fixture: ComponentFixture<Animals>;
  let animalsService: jasmine.SpyObj<AnimalsService>;

  beforeEach(async () => {
    animalsService = jasmine.createSpyObj('AnimalsService', [
      'getAnimals$', 'addAnimal$', 'updateAnimal$', 'deleteAnimal$'
    ]);
    animalsService.getAnimals$.and.returnValue(of({ data: [], total: 0 } as any));

    const catalogsService = jasmine.createSpyObj('CatalogsService', ['getAllBreeds$', 'getAllColors$', 'getAllHairTypes$']);
    catalogsService.getAllBreeds$.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Animals, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AnimalsService, useValue: animalsService },
        { provide: CatalogsService, useValue: catalogsService },
        { provide: AuthService, useValue: mockAuthService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Animals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
