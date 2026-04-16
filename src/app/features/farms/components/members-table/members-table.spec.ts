import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MembersTable } from './members-table';
import { MembersService } from '../../../members/services/members-service';
import { of } from 'rxjs';

describe('MembersTable', () => {
  let component: MembersTable;
  let fixture: ComponentFixture<MembersTable>;
  let membersService: jasmine.SpyObj<MembersService>;

  beforeEach(async () => {
    membersService = jasmine.createSpyObj('MembersService', ['getMembers$', 'searchMembers']);
    membersService.getMembers$.and.returnValue(of({ data: [] } as any));

    await TestBed.configureTestingModule({
      imports: [MembersTable, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MembersService, useValue: membersService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MembersTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
