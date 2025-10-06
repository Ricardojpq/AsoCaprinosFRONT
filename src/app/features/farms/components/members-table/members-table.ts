import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideAngularModule, Search, X, Check, User, Users, Star } from 'lucide-angular';
import { ToolbarModule } from 'primeng/toolbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PropietarioFincaDto } from '../../models/finca.dto';
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

export interface PropietarioSelectionResult {
  propietarios: PropietarioFincaDto[];
  ced_principal: string;
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
    ToolbarModule,
    RadioButtonModule
  ],
  templateUrl: './members-table.html',
  styleUrl: './members-table.css'
})
export class MembersTable implements OnInit, OnDestroy, OnChanges {
  @Input() visible: boolean = false;
  @Input() title: string = 'Seleccionar Propietarios';
  @Input() selectedOwners: PropietarioFincaDto[] = []; // Propietarios preseleccionados
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() socioSelected = new EventEmitter<SocioSelectionDto>();
  @Output() ownersConfirmed = new EventEmitter<PropietarioFincaDto[]>(); // Emite propietarios confirmados

  socios: SocioSelectionDto[] = [];
  selectedSocio: SocioSelectionDto | null = null;
  selectedSocios: SocioSelectionDto[] = []; // Selección múltiple
  cedPrincipal: string = ''; // Cédula del propietario principal
  showPrincipalDialog: boolean = false; // Diálogo para seleccionar principal
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
  readonly checkIcon = Check;
  readonly userIcon = User;
  readonly usersIcon = Users;
  readonly starIcon = Star;

  constructor(private membersService: MembersService) {}

  ngOnInit() {
    this.setupSearchPipe();
    this.loadMembers();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Cuando se abre el diálogo y hay propietarios preseleccionados
    if (changes['visible'] && this.visible && this.selectedOwners.length > 0) {
      this.preselectOwners();
    }
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
        
        // Preseleccionar propietarios si hay datos cargados
        if (this.selectedOwners.length > 0) {
          this.preselectOwners();
        }
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

  /**
   * Preselecciona los propietarios que ya están en selectedOwners
   */
  private preselectOwners() {
    if (!this.selectedOwners || this.selectedOwners.length === 0) {
      return;
    }

    // Filtrar los socios que coinciden con los propietarios seleccionados
    this.selectedSocios = this.socios.filter(socio => 
      this.selectedOwners.some(owner => owner.ced_propietario === socio.ced_socio)
    );

    console.log('Propietarios preseleccionados:', this.selectedSocios);
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
    this.selectedSocios = [];
    this.cedPrincipal = '';
    this.showPrincipalDialog = false;
  }

  // Método para confirmar selección múltiple
  confirmSelection() {
    if (this.selectedSocios.length === 0) {
      return;
    }

    // Si solo hay un propietario, es automáticamente el principal
    if (this.selectedSocios.length === 1) {
      const propietarios: PropietarioFincaDto[] = [{
        ced_propietario: this.selectedSocios[0].ced_socio,
        propietario_principal: true,
        nombre_completo: this.getFullName(this.selectedSocios[0])
      }];
      this.ownersConfirmed.emit(propietarios);
      this.hideDialog();
      return;
    }

    // Si hay múltiples, mostrar diálogo para seleccionar principal
    this.cedPrincipal = this.selectedSocios[0].ced_socio; // Preseleccionar el primero
    this.showPrincipalDialog = true;
  }

  // Confirmar propietario principal
  confirmPrincipal() {
    if (!this.cedPrincipal) {
      return;
    }

    const propietarios: PropietarioFincaDto[] = this.selectedSocios.map(socio => ({
      ced_propietario: socio.ced_socio,
      propietario_principal: socio.ced_socio === this.cedPrincipal,
      nombre_completo: this.getFullName(socio) // Agregar nombre completo
    }));

    this.ownersConfirmed.emit(propietarios);
    this.hideDialog();
  }

  // Cancelar selección de principal
  cancelPrincipal() {
    this.showPrincipalDialog = false;
    this.cedPrincipal = '';
  }

  // Obtener nombre completo
  getFullName(socio: SocioSelectionDto): string {
    return `${socio.nom_persona} ${socio.ape_persona}`;
  }
}
