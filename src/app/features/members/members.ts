import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { firstValueFrom, BehaviorSubject, Subject } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  filter,
} from 'rxjs/operators';
import { MembersService, MemberQueryParams } from './services/members-service';
import { MemberDto, MemberCreateDto, MemberUpdateDto, PaginatedMembersDto } from './models/DTOs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import {
  LucideAngularModule,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
} from 'lucide-angular';
import { TextareaModule } from 'primeng/textarea';
import { DatePipe } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-members',
  templateUrl: './members.html', 
  styleUrl: './members.css',
  providers: [MessageService, ConfirmationService, DatePipe],
  imports: [
    FormsModule,
    ButtonModule,
    FileUploadModule,
    DialogModule,
    ConfirmDialogModule,
    TableModule,
    TagModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    SelectModule,
    LucideAngularModule,
    TextareaModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    DatePickerModule,
  ],
})
export class Members implements OnInit, OnDestroy {
  readonly trashIcon = Trash2;
  readonly pencilIcon = Pencil;
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly xIcon = X;

  // BehaviorSubject para el término de búsqueda
  private searchSubject$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  // Configuración de búsqueda
  readonly SEARCH_MIN_LENGTH = 2;
  private readonly SEARCH_DEBOUNCE_TIME = 500;

  members: MemberDto[] = [];
  selectedMembers: MemberDto[] = [];
  member: Partial<MemberDto> = {};
  memberDialog = false;
  isEditMode = false;
  cols: any[] = [];
  loading = false;
  submitted = false;
  totalRecords = 0;
  page = 1;
  perPage = 10;
  sortField = 'ced_socio';
  sortOrder: 'asc' | 'desc' = 'asc';
  filters: Partial<MemberQueryParams> = {};
  globalFilterValue = '';
  @ViewChild('dt') dt!: Table;

  // Opciones para los selects
  statusOptions = [
    { label: 'Activo', value: 'A' },
    { label: 'Inactivo', value: 'I' },
  ];

  activeOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ];

  sexoOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
  ];

  // Getters y setters para acceso seguro a propiedades de persona
  get personaNombre(): string {
    return this.member.persona?.nom_persona || '';
  }
  set personaNombre(value: string) {
    if (!this.member.persona) this.member.persona = {} as any;
    this.member.persona!.nom_persona = value;
  }

  get personaApellido(): string {
    return this.member.persona?.ape_persona || '';
  }
  set personaApellido(value: string) {
    if (!this.member.persona) this.member.persona = {} as any;
    this.member.persona!.ape_persona = value;
  }

  get personaTelefono(): string {
    return this.member.persona?.tlf_persona || '';
  }
  set personaTelefono(value: string) {
    if (!this.member.persona) this.member.persona = {} as any;
    this.member.persona!.tlf_persona = value;
  }

  get personaCelular(): string {
    return this.member.persona?.cel_persona || '';
  }
  set personaCelular(value: string) {
    if (!this.member.persona) this.member.persona = {} as any;
    this.member.persona!.cel_persona = value;
  }

  get personaEmail(): string {
    return this.member.persona?.email_persona || '';
  }
  set personaEmail(value: string) {
    if (!this.member.persona) this.member.persona = {} as any;
    this.member.persona!.email_persona = value;
  }

  get personaDireccion(): string {
    return this.member.persona?.dir_persona || '';
  }
  set personaDireccion(value: string) {
    if (!this.member.persona) this.member.persona = {} as any;
    this.member.persona!.dir_persona = value;
  }

  get personaFechaNacimiento(): string {
    return this.member.persona?.fnac_persona || '';
  }
  set personaFechaNacimiento(value: string) {
    if (!this.member.persona) this.member.persona = {} as any;
    this.member.persona!.fnac_persona = value;
  }

  get personaSexo(): string | undefined {
    return this.member.persona?.sexo_persona;
  }
  set personaSexo(value: string | undefined) {
    if (!this.member.persona) this.member.persona = {} as any;
    this.member.persona!.sexo_persona = value;
  }

  constructor(
    private membersService: MembersService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'ced_socio', header: 'Cédula' },
      { field: 'persona.nom_persona', header: 'Nombre' },
      { field: 'persona.ape_persona', header: 'Apellido' },
      { field: 'persona.tlf_persona', header: 'Teléfono' },
      { field: 'persona.dir_persona', header: 'Dirección' },
      { field: 'persona.email_persona', header: 'Email' },
      { field: 'estatus_socio', header: 'Estado' },
    ];

    // Configurar el pipe de búsqueda
    this.setupSearchPipe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configura el pipe de búsqueda con debounce y filtro de longitud mínima
   */
  private setupSearchPipe() {
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(this.SEARCH_DEBOUNCE_TIME),
        distinctUntilChanged(),
        filter((searchTerm) => searchTerm.length === 0 || searchTerm.length >= this.SEARCH_MIN_LENGTH)
      )
      .subscribe((searchTerm) => {
        // Limpiar filtros anteriores
        this.filters.ced_socio = undefined;
        this.filters['nom_persona'] = undefined;
        this.filters['ape_persona'] = undefined;
        this.filters['global_search'] = undefined;
        
        if (searchTerm) {
          // Usar búsqueda global en lugar de filtros individuales
          this.filters['global_search'] = searchTerm;
        }
        
        this.loadMembers();
      });
  }

  /**
   * Limpia la búsqueda y recarga los datos
   */
  clearSearch() {
    this.globalFilterValue = '';
    this.searchSubject$.next('');
    this.filters.ced_socio = undefined;
    this.filters['nom_persona'] = undefined;
    this.filters['ape_persona'] = undefined;
    this.filters['global_search'] = undefined;
    this.loadMembers();
  }

  loadMembers(event?: any) {
    this.loading = true;
    // Si viene evento de PrimeNG Table (paginación, sort, filtro)
    if (event) {
      this.page = Math.floor(event.first / event.rows) + 1;
      this.perPage = event.rows;
      if (event.sortField) {
        this.sortField = event.sortField;
        this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
      }
      // Filtros globales
      if (event.filters) {
        this.filters = {};
        Object.keys(event.filters).forEach((key) => {
          const val = event.filters[key]?.value;
          if (val) this.filters[key] = val;
        });
      }
    }
    const query: MemberQueryParams = {
      per_page: this.perPage as 10 | 25 | 50 | 100,
      sort_by: this.sortField as 'ced_socio' | 'cod_finca' | 'estatus_socio' | 'fec_ingreso' | 'created_at',
      sort_dir: this.sortOrder,
      ...this.filters,
    };
    this.membersService.getMembers$(query).subscribe({
      next: (res) => {
        this.members = res.data || [];
        this.totalRecords = res.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.members = [];
        this.totalRecords = 0;
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los socios',
          life: 3000,
        });
      },
    });
  }

  onTableLazyLoad(event: any) {
    this.loadMembers(event);
  }

  onGlobalFilter(event: any) {
    const searchTerm = event.target.value;
    this.globalFilterValue = searchTerm;
    this.searchSubject$.next(searchTerm);
  }

  openNew() {
    this.member = {
      ced_socio: '',
      estatus_socio: 'A',
      persona: {
        ced_persona: '',
        nom_persona: '',
        ape_persona: '',
        dir_persona: '',
        tlf_persona: '',
        email_persona: '',
        fnac_persona: '',
        sexo_persona: undefined,
        is_active: true,
      }
    };
    this.isEditMode = false;
    this.memberDialog = true;
    this.submitted = false;
  }

  editMember(member: MemberDto) {
    this.member = { 
      ...member,
      persona: member.persona ? { ...member.persona } : {
        ced_persona: '',
        nom_persona: '',
        ape_persona: '',
        dir_persona: '',
        tlf_persona: '',
        email_persona: '',
        fnac_persona: '',
        sexo_persona: undefined,
        is_active: true,
      }
    };
    this.isEditMode = true;
    this.memberDialog = true;
    this.submitted = false;
  }

  deleteMember(member: MemberDto) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar el socio con cédula ${member.ced_socio}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.membersService
          .deleteMember$(member.ced_socio)
          .subscribe({
            next: () => {
              this.loadMembers();
              this.loading = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Eliminado',
                detail: 'Socio eliminado',
                life: 3000,
              });
            },
            error: (error) => {
              console.error('Error deleting member:', error);
              this.loading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar el socio',
                life: 3000,
              });
            },
          });
      },
    });
  }

  deleteSelectedMembers() {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar los socios seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        const deletes = this.selectedMembers.map((m) =>
          this.membersService.deleteMember$(m.ced_socio)
        );
        Promise.all(deletes.map((obs) => firstValueFrom(obs)))
          .then(() => {
            this.loadMembers();
            this.selectedMembers = [];
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminados',
              detail: 'Socios eliminados',
              life: 3000,
            });
          })
          .catch((error) => {
            console.error('Error deleting members:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar los socios',
              life: 3000,
            });
          });
      },
    });
  }

  hideDialog() {
    this.memberDialog = false;
    this.member = {};
    this.isEditMode = false;
    this.submitted = false;
  }

  validateMember(): boolean {
    if (!this.member.ced_socio?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La cédula del socio es requerida'
      });
      return false;
    }

    if (!this.member.cod_finca || this.member.cod_finca <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El código de finca es requerido'
      });
      return false;
    }

    if (!this.personaNombre.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre es requerido'
      });
      return false;
    }

    if (!this.personaApellido.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El apellido es requerido'
      });
      return false;
    }

    // Validate email format if provided
    if (this.personaEmail && !this.isValidEmail(this.personaEmail)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El formato del email no es válido'
      });
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  saveMember() {
    if (!this.validateMember()) {
      return;
    }

    this.submitted = true;

    this.loading = true;

    if (this.isEditMode) {
      // Update - enviar campos que se pueden actualizar incluyendo datos de persona
      const updateData: MemberUpdateDto = {
        estatus_socio: this.member.estatus_socio
      };

      this.membersService
        .updateMember$(
          this.member.ced_socio!,
          updateData,
          this.member.cod_finca!
        )
        .subscribe({
          next: () => {
            this.loadMembers();
            this.memberDialog = false;
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Actualizado',
              detail: 'Socio actualizado',
              life: 3000,
            });
          },
          error: (error: any) => {
            console.error('Error updating member:', error);
            this.loading = false;

            let errorDetail = 'Error al actualizar el socio';
            if (error.details && error.details.detail) {
              errorDetail = error.details.detail;
            } else if (error.message) {
              errorDetail = error.message;
            }

            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorDetail,
              life: 5000,
            });
          },
        });
    } else {
      // Create - enviar todos los campos requeridos
      const createData: MemberCreateDto = {
        ced_socio: this.member.ced_socio!,
        cod_finca: this.member.cod_finca || 1,
        estatus_socio: this.member.estatus_socio || 'A'
      };

      this.membersService.addMember$(createData).subscribe({
        next: () => {
          this.loadMembers();
          this.memberDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Socio creado',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error creating member:', error);
          this.loading = false;

          let errorDetail = 'Error al crear el socio';
          if (error.details && error.details.detail) {
            errorDetail = error.details.detail;
          } else if (error.message) {
            errorDetail = error.message;
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorDetail,
            life: 5000,
          });
        },
      });
    }
  }
}
