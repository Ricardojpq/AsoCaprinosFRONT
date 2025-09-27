import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountGeneral } from './account-general';

describe('AccountGeneral', () => {
  let component: AccountGeneral;
  let fixture: ComponentFixture<AccountGeneral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountGeneral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountGeneral);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
