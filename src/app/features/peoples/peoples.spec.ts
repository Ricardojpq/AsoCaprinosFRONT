import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Peoples } from './peoples';

describe('Peoples', () => {
  let component: Peoples;
  let fixture: ComponentFixture<Peoples>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Peoples]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Peoples);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
