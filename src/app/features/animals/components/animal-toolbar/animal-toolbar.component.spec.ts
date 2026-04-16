import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AnimalToolbarComponent } from './animal-toolbar.component';

describe('AnimalToolbarComponent', () => {
  let component: AnimalToolbarComponent;
  let fixture: ComponentFixture<AnimalToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalToolbarComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
