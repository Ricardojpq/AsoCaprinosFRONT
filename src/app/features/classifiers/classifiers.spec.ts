import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Classifiers } from './classifiers';
import { ClassifiersService } from './services/classifiers-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('Classifiers', () => {
  let component: Classifiers;
  let fixture: ComponentFixture<Classifiers>;
  let classifiersService: jasmine.SpyObj<ClassifiersService>;

  beforeEach(async () => {
    classifiersService = jasmine.createSpyObj('ClassifiersService', [
      'getClasificadores', 'getClasificador', 'createClasificador', 'updateClasificador', 'deleteClasificador'
    ]);
    classifiersService.getClasificadores.and.returnValue(of({ data: [], total: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [Classifiers, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ClassifiersService, useValue: classifiersService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Classifiers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load classifiers on init', () => {
    expect(classifiersService.getClasificadores).toHaveBeenCalled();
  });

  it('should open dialog for new classifier', () => {
    component.openNew();
    expect(component.clasificadorDialog).toBeTrue();
    expect(component.clasificadorForm.get('ced_clasificador')).toBeTruthy();
  });

  it('should hide dialog', () => {
    component.clasificadorDialog = true;
    component.hideDialog();
    expect(component.clasificadorDialog).toBeFalse();
  });
});
