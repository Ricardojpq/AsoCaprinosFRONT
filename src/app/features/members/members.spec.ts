import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Members } from './members';
import { MembersService } from './services/members-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

describe('Members', () => {
  let component: Members;
  let fixture: ComponentFixture<Members>;
  let membersService: jasmine.SpyObj<MembersService>;

  beforeEach(async () => {
    membersService = jasmine.createSpyObj('MembersService', [
      'getMembers$', 'getMemberById$', 'updateMember$', 'deleteMember$'
    ]);
    membersService.getMembers$.and.returnValue(of({ data: [], total: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [Members, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MembersService, useValue: membersService },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Members);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load members on init', () => {
    expect(membersService.getMembers$).toHaveBeenCalled();
  });
});
