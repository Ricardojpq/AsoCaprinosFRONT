import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Security } from './security';
import { MessageService } from 'primeng/api';

const mockMessageService = {
  add: jasmine.createSpy('add'),
  clear: jasmine.createSpy('clear')
};

describe('Security', () => {
  let component: Security;
  let fixture: ComponentFixture<Security>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Security, NoopAnimationsModule],
      providers: [
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Security);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
