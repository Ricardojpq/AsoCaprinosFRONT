import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Classifiers } from './classifiers';

describe('Classifiers', () => {
  let component: Classifiers;
  let fixture: ComponentFixture<Classifiers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Classifiers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Classifiers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
