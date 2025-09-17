import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticalDivision } from './political-division';

describe('PoliticalDivision', () => {
  let component: PoliticalDivision;
  let fixture: ComponentFixture<PoliticalDivision>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticalDivision]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticalDivision);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
