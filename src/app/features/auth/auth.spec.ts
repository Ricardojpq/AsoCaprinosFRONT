import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from './auth';
import { Router } from '@angular/router';

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
  url: '/auth/login'
};

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
