import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Configuracion } from './configuracion';
import { ReproductionService } from '../../services/reproduction.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

describe('Configuracion', () => {
  let component: Configuracion;
  let fixture: ComponentFixture<Configuracion>;
  let reproductionService: jasmine.SpyObj<ReproductionService>;

  beforeEach(async () => {
    reproductionService = jasmine.createSpyObj('ReproductionService', [
      'getParameters', 'createParameter', 'updateParameter', 'deleteParameter'
    ]);
    reproductionService.getParameters.and.returnValue(of({ data: { data: [], total: 0 } } as any));

    await TestBed.configureTestingModule({
      imports: [Configuracion, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReproductionService, useValue: reproductionService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Configuracion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
