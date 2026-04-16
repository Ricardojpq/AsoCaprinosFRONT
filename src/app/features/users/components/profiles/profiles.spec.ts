import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Profiles } from './profiles';
import { PerfilesService } from '../../services/perfiles.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('Profiles', () => {
  let component: Profiles;
  let fixture: ComponentFixture<Profiles>;
  let perfilesService: jasmine.SpyObj<PerfilesService>;

  beforeEach(async () => {
    perfilesService = jasmine.createSpyObj('PerfilesService', [
      'getPerfiles', 'getModulos', 'getModulosFlat', 'createPerfil', 'updatePerfil', 'deletePerfil', 'getPermisos', 'updatePermisos'
    ]);
    perfilesService.getPerfiles.and.returnValue(of({ data: [], total: 0 } as any));
    perfilesService.getModulos.and.returnValue(of([] as any));
    perfilesService.getModulosFlat.and.returnValue(of([] as any));

    await TestBed.configureTestingModule({
      imports: [Profiles, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PerfilesService, useValue: perfilesService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Profiles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profiles on init', () => {
    expect(perfilesService.getPerfiles).toHaveBeenCalled();
  });
});
