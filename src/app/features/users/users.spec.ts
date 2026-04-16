import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Users } from './users';
import { Router } from '@angular/router';

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
  url: '/users'
};

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
