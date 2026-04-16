import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Moduls } from './moduls';
import { PerfilesService } from '../../services/perfiles.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

describe('Moduls', () => {
  let component: Moduls;
  let fixture: ComponentFixture<Moduls>;
  let perfilesService: jasmine.SpyObj<PerfilesService>;

  beforeEach(async () => {
    perfilesService = jasmine.createSpyObj('PerfilesService', ['getModulos', 'getModulosFlat']);
    perfilesService.getModulos.and.returnValue(of([] as any));
    perfilesService.getModulosFlat.and.returnValue(of([] as any));

    await TestBed.configureTestingModule({
      imports: [Moduls, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PerfilesService, useValue: perfilesService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Moduls);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
