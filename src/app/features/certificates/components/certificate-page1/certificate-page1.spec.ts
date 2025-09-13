import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificatePage1 } from './certificate-page1';

describe('CertificatePage1', () => {
  let component: CertificatePage1;
  let fixture: ComponentFixture<CertificatePage1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificatePage1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificatePage1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
