import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AnimalSearchComponent } from './animal-search.component';

describe('AnimalSearchComponent', () => {
  let component: AnimalSearchComponent;
  let fixture: ComponentFixture<AnimalSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalSearchComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
