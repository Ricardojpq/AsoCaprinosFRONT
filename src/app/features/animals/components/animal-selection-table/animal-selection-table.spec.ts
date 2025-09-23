import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalSelectionTable } from './animal-selection-table';

describe('AnimalSelectionTable', () => {
  let component: AnimalSelectionTable;
  let fixture: ComponentFixture<AnimalSelectionTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalSelectionTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalSelectionTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
