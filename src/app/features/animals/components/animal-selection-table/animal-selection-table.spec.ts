import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AnimalSelectionTable } from './animal-selection-table';
import { MessageService } from 'primeng/api';

describe('AnimalSelectionTable', () => {
  let component: AnimalSelectionTable;
  let fixture: ComponentFixture<AnimalSelectionTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalSelectionTable, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalSelectionTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
