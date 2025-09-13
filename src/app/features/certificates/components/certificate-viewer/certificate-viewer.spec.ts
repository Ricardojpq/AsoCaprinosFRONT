import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateViewer } from './certificate-viewer';

describe('CertificateViewer', () => {
  let component: CertificateViewer;
  let fixture: ComponentFixture<CertificateViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
