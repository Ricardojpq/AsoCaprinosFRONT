import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterConfiguration } from './parameter-configuration';

describe('ParameterConfiguration', () => {
  let component: ParameterConfiguration;
  let fixture: ComponentFixture<ParameterConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParameterConfiguration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParameterConfiguration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
