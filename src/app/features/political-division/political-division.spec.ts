import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PoliticalDivisionComponent } from './political-division';
import { PoliticalDivisionService } from './Services/political-division-service';
import { of } from 'rxjs';

describe('PoliticalDivisionComponent', () => {
  let component: PoliticalDivisionComponent;
  let fixture: ComponentFixture<PoliticalDivisionComponent>;
  let politicalDivisionService: jasmine.SpyObj<PoliticalDivisionService>;

  beforeEach(async () => {
    politicalDivisionService = jasmine.createSpyObj('PoliticalDivisionService', ['getCountries']);
    politicalDivisionService.getCountries.and.returnValue(of({ data: { data: [] } } as any));

    await TestBed.configureTestingModule({
      imports: [PoliticalDivisionComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PoliticalDivisionService, useValue: politicalDivisionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PoliticalDivisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
