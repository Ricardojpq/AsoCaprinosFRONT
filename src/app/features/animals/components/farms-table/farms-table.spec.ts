import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FarmsTable } from './farms-table';
import { MessageService } from 'primeng/api';

describe('FarmsTable', () => {
  let component: FarmsTable;
  let fixture: ComponentFixture<FarmsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmsTable, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FarmsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
