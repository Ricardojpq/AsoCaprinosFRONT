import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Certificates } from './certificates';
import { CertificatesService } from './services/certificates-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { of } from 'rxjs';

describe('Certificates', () => {
  let component: Certificates;
  let fixture: ComponentFixture<Certificates>;
  let certificatesService: jasmine.SpyObj<CertificatesService>;

  beforeEach(async () => {
    certificatesService = jasmine.createSpyObj('CertificatesService', [
      'getCertificates', 'createCertificate', 'updateCertificate', 'deleteCertificate', 'searchCertificates'
    ]);
    certificatesService.getCertificates.and.returnValue(of({ data: { data: [], total: 0 } } as any));

    await TestBed.configureTestingModule({
      imports: [Certificates, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CertificatesService, useValue: certificatesService },
        { provide: SvgIconRegistryService, useValue: { loadSvg: jasmine.createSpy('loadSvg') } },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Certificates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
