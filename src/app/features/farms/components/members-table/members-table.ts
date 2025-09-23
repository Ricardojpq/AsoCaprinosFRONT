import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideAngularModule, Search, X } from 'lucide-angular';
import { ToolbarModule } from 'primeng/toolbar';
import { MembersService, MemberQueryParams } from '../../../members/services/members-service';
import { MemberDto } from '../../../members/models/DTOs/member';
import { LaravelPaginationResponse } from '../../../../core/models/DTOs';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface SocioSelectionDto {
  ced_socio: string;
  nom_persona: string;
  ape_persona: string;
  tlf_persona?: string;
  finca?: string;
}

@Component({
  selector: 'app-members-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    LucideAngularModule,
    ToolbarModule
  ],
  templateUrl: './members-table.html',
  styleUrl: './members-table.css'
})
export class MembersTable implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Input() title: string = 'Seleccionar Socio';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() socioSelected = new EventEmitter<SocioSelectionDto>();

  socios: SocioSelectionDto[] = [];
  selectedSocio: SocioSelectionDto | null = null;
  globalFilterValue: string = '';
  totalRecords: number = 0;

  // Properties for real data
  members: MemberDto[] = [];
  loading: boolean = false;
  page: number = 1;
  perPage: number = 10;
  sortField: string = 'ced_socio';
  sortOrder: string = 'asc';
  
  // Search functionality
  private searchSubject$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();
  
  // Icons
  readonly searchIcon = Search;
  readonly xIcon = X;

  constructor(private membersService: MembersService) {}

  ngOnInit() {
    this.setupSearchPipe();
    this.loadMembers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchPipe() {
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((searchTerm) => {
        this.globalFilterValue = searchTerm;
        this.page = 1;
        this.loadMembers();
      });
  }

  loadMembers() {
    this.loading = true;
    
    const params: MemberQueryParams = {
      page: this.page,
      per_page: this.perPage as 10 | 25 | 50 | 100,
      sort_by: this.mapSortField(this.sortField),
      sort_dir: this.sortOrder as 'asc' | 'desc',
      global_search: this.globalFilterValue || undefined
    };

    this.membersService.getMembers$(params).subscribe({
      next: (response) => {
        this.members = response.data || [];
        this.totalRecords = response.total || 0;
        this.socios = this.mapMembersToSocios(this.members);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.loading = false;
        this.members = [];
        this.socios = [];
        this.totalRecords = 0;
      }
    });
  }

  private mapSortField(frontendField: string): 'ced_socio' | 'cod_finca' | 'estatus_socio' | 'fec_ingreso' | 'created_at' {
    const fieldMapping: Record<string, 'ced_socio' | 'cod_finca' | 'estatus_socio' | 'fec_ingreso' | 'created_at'> = {
      'ced_socio': 'ced_socio',
      'persona.nom_persona': 'ced_socio', // Backend doesn't support nested sorting, fallback to ced_socio
      'persona.ape_persona': 'ced_socio', // Backend doesn't support nested sorting, fallback to ced_socio
      'persona.tlf_persona': 'ced_socio', // Backend doesn't support nested sorting, fallback to ced_socio
      'cod_finca': 'cod_finca',
      'estatus_socio': 'estatus_socio',
      'fec_ingreso': 'fec_ingreso',
      'created_at': 'created_at'
    };
    
    return fieldMapping[frontendField] || 'ced_socio';
  }

  private mapMembersToSocios(members: MemberDto[]): SocioSelectionDto[] {
    return members.map(member => ({
      ced_socio: member.ced_socio,
      nom_persona: member.persona?.nom_persona || '',
      ape_persona: member.persona?.ape_persona || '',
      tlf_persona: member.persona?.tlf_persona || '',
      finca: member.finca?.nomb_finca || ''
    }));
  }

  onGlobalFilter(event: any) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject$.next(searchTerm);
  }

  clearSearch() {
    this.searchSubject$.next('');
  }

  onTableLazyLoad(event: any) {
    this.page = (event.first / event.rows) + 1;
    this.perPage = event.rows;
    
    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    }
    
    this.loadMembers();
  }

  onRowSelect(event: any) {
    this.selectedSocio = event.data;
  }

  onRowUnselect(event: any) {
    this.selectedSocio = null;
  }

  selectSocio() {
    if (this.selectedSocio) {
      this.socioSelected.emit(this.selectedSocio);
      this.hideDialog();
    }
  }

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.selectedSocio = null;
  }
}
