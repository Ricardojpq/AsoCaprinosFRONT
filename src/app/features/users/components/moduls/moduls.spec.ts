import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Moduls } from './moduls';

describe('Moduls', () => {
  let component: Moduls;
  let fixture: ComponentFixture<Moduls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Moduls]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Moduls);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
