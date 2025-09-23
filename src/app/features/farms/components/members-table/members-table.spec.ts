import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersTable } from './members-table';

describe('MembersTable', () => {
  let component: MembersTable;
  let fixture: ComponentFixture<MembersTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembersTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembersTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
