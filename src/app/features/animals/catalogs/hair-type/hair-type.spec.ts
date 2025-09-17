import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairType } from './hair-type';

describe('HairType', () => {
  let component: HairType;
  let fixture: ComponentFixture<HairType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HairType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HairType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
