import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificatePage2 } from './certificate-page2';

describe('CertificatePage2', () => {
  let component: CertificatePage2;
  let fixture: ComponentFixture<CertificatePage2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificatePage2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificatePage2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
