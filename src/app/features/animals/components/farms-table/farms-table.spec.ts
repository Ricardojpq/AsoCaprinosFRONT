import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmsTable } from './farms-table';

describe('FarmsTable', () => {
  let component: FarmsTable;
  let fixture: ComponentFixture<FarmsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
