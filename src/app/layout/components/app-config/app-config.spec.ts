import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppConfig } from './app-config';

describe('AppConfig', () => {
  let component: AppConfig;
  let fixture: ComponentFixture<AppConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
