import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserManagementComponent } from './user-management';
import { UserManagementService } from '@core/services/user-management.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let userManagementService: jasmine.SpyObj<UserManagementService>;

  beforeEach(async () => {
    userManagementService = jasmine.createSpyObj('UserManagementService', [
      'getUsers', 'createUser', 'updateUser', 'deleteUser', 'toggleUserStatus', 'resetPassword'
    ]);
    userManagementService.getUsers.and.returnValue(of({ data: [] } as any));

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserManagementService, useValue: userManagementService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(userManagementService.getUsers).toHaveBeenCalled();
  });
});
