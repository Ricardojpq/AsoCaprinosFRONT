import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicalCondition } from './physical-condition';

describe('PhysicalCondition', () => {
  let component: PhysicalCondition;
  let fixture: ComponentFixture<PhysicalCondition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhysicalCondition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicalCondition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
