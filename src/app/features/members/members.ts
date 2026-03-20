import { Component, OnInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { FincaContextService } from '@core/services/finca-context.service';
import { firstValueFrom, BehaviorSubject, Subject } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  filter,
} from 'rxjs/operators';
import { MembersService, MemberQueryParams } from './services/members-service';
import { MemberDto, MemberCreateDto, MemberUpdateDto, PaginatedMembersDto } from './models/DTOs';
import { LaravelPaginationResponse } from '../../shared/models/base-catalog-entity.interface';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    ReactiveFormsModule,
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

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Data
  members: MemberDto[] = [];
  
  // Forms
  memberForm!: FormGroup;
  
  // UI State
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

  // Current member for editing
  currentMember: MemberDto | null = null;

  // Servicio de contexto de finca
  private fincaContext = inject(FincaContextService);

  constructor(
    private fb: FormBuilder,
    private membersService: MembersService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.cols = [
      { field: 'ced_socio', header: 'Cédula' },
      { field: 'nom_persona', header: 'Nombre' },
      { field: 'ape_persona', header: 'Apellido' },
      { field: 'tel_persona', header: 'Teléfono' },
      { field: 'dir_persona', header: 'Dirección' },
      { field: 'email_persona', header: 'Email' },
      { field: 'estatus_socio', header: 'Estado' },
    ];

    // Configurar el debounce de búsqueda
    this.setupSearchDebounce();
    this.loadMembers();
  }

  private initializeForm() {
    this.memberForm = this.fb.group({
      // Campos requeridos según backend
      ced_socio: ['', [Validators.required, Validators.maxLength(20)]],
      cod_finca: ['', [Validators.required, Validators.maxLength(20)]],
      
      // Campos opcionales del socio
      estatus_socio: ['A'],
      fec_ingreso: [''],
      observaciones: ['', [Validators.maxLength(500)]],
      
      // Campos obligatorios de persona
      nom_persona: ['', [Validators.required, Validators.maxLength(50)]],
      ape_persona: ['', [Validators.required, Validators.maxLength(50)]],
      tel_persona: ['', [Validators.required, Validators.maxLength(20)]],
      fec_nacim: ['', [Validators.required]],
      sexo_persona: ['', [Validators.required]],

      // Campos opcionales de persona
      email_persona: ['', [Validators.email, Validators.maxLength(80)]],
      dir_persona: ['', [Validators.maxLength(200)]],
      cod_pais: [null],
      cod_estado: [null],
      cod_municipio: [null],
      cod_ciudad: [null]
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(searchTerm => searchTerm === '' || searchTerm.length >= 1),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  private performSearch(searchTerm: string) {
    if (searchTerm.trim()) {
      this.searchMembers();
    } else {
      this.loadMembers();
    }
  }

  searchMembers() {
    if (this.globalFilterValue.trim()) {
      this.loading = true;
      this.membersService.searchMembers(this.globalFilterValue, this.perPage)
        .subscribe({
          next: (response: LaravelPaginationResponse<MemberDto>) => {
            this.members = response.data;
            this.totalRecords = response.total;
            this.loading = false;
          },
          error: (error: any) => {
            console.error('Error searching members:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error en la búsqueda'
            });
            this.loading = false;
          }
        });
    }
  }

  clearSearch() {
    this.globalFilterValue = '';
    this.page = 1;
    this.searchSubject.next('');
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
      sort_by: this.sortField as 'ced_socio' | 'cod_finca' | 'estatus_socio' | 'fec_ingreso' | 'created_at' | 'nom_persona' | 'ape_persona' | 'tel_persona' | 'email_persona',
      sort_dir: this.sortOrder,
      ...this.filters,
      // Filtrar por finca seleccionada
      ...this.fincaContext.getFincaQueryParams(),
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
    this.globalFilterValue = event.target.value;
    this.page = 1;
    this.searchSubject.next(this.globalFilterValue);
  }

  openNew() {
    this.memberForm.reset({
      ced_socio: '',
      cod_finca: '',
      estatus_socio: 'A',
      fec_ingreso: '',
      observaciones: '',
      nom_persona: '',
      ape_persona: '',
      tel_persona: '',
      email_persona: '',
      dir_persona: '',
      sexo_persona: '',
      fec_nacim: '',
      cod_pais: null,
      cod_estado: null,
      cod_municipio: null,
      cod_ciudad: null
    });
    this.isEditMode = false;
    this.currentMember = null;
    this.memberDialog = true;
    this.submitted = false;
  }

  editMember(member: MemberDto) {
    console.log('Editing member:', member);
    this.currentMember = member;
    
    // Convertir fechas de string a Date para PrimeNG DatePicker
    const fecIngreso = member.fec_ingreso ? new Date(member.fec_ingreso) : null;
    const fecNacim = member.persona?.fnac_persona ? new Date(member.persona.fnac_persona) : null;
    
    this.memberForm.patchValue({
      ced_socio: member.ced_socio,
      cod_finca: member.cod_finca || '',
      estatus_socio: member.estatus_socio || 'A',
      fec_ingreso: fecIngreso,
      observaciones: member.observaciones || '',
      nom_persona: member.persona?.nom_persona || '',
      ape_persona: member.persona?.ape_persona || '',
      tel_persona: member.persona?.tlf_persona || '',
      email_persona: member.persona?.email_persona || '',
      dir_persona: member.persona?.dir_persona || '',
      sexo_persona: member.persona?.sexo_persona || '',
      fec_nacim: fecNacim,
      cod_pais: null,
      cod_estado: null,
      cod_municipio: null,
      cod_ciudad: null
    });
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

  // Método eliminado - ya no se usa bulk delete

  hideDialog() {
    this.memberDialog = false;
    this.memberForm.reset();
    this.isEditMode = false;
    this.currentMember = null;
    this.submitted = false;
  }

  // Helper para acceder a los controles del formulario
  get f() {
    return this.memberForm.controls;
  }

  private formatDateForBackend(date: any, required: boolean = false): string | undefined {
    if (!date) {
      return required ? new Date().toISOString().split('T')[0] : undefined;
    }
    
    // Si es una fecha de PrimeNG DatePicker, convertir a formato YYYY-MM-DD
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    
    // Si ya es string, verificar si está en formato ISO y convertir
    if (typeof date === 'string') {
      if (date.includes('T')) {
        return new Date(date).toISOString().split('T')[0];
      }
      return date;
    }
    
    return required ? new Date().toISOString().split('T')[0] : undefined;
  }

  saveMember() {
    this.submitted = true;

    if (this.memberForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Completa todos los campos obligatorios',
        life: 3000,
      });
      return;
    }

    this.loading = true;
    const formData = this.memberForm.value;

    if (this.isEditMode) {
      // Update - enviar campos que se pueden actualizar
      const updateData: MemberUpdateDto = {
        estatus_socio: formData.estatus_socio,
        fec_ingreso: this.formatDateForBackend(formData.fec_ingreso),
        observaciones: formData.observaciones,
        // Campos de persona opcionales
        nom_persona: formData.nom_persona,
        ape_persona: formData.ape_persona,
        tel_persona: formData.tel_persona,
        email_persona: formData.email_persona,
        dir_persona: formData.dir_persona,
        sexo_persona: formData.sexo_persona,
        fec_nacim: this.formatDateForBackend(formData.fec_nacim)
      };

      if (!this.currentMember) {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo identificar el socio a actualizar',
          life: 3000,
        });
        return;
      }

      console.log(updateData);
      

      this.membersService
        .updateMember$(
          this.currentMember.ced_socio,
          updateData,
          this.currentMember.cod_finca!
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
            if (error.error && error.error.message) {
              errorDetail = error.error.message;
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
        ced_socio: formData.ced_socio,
        cod_finca: formData.cod_finca,
        estatus_socio: formData.estatus_socio || 'A',
        fec_ingreso: this.formatDateForBackend(formData.fec_ingreso),
        observaciones: formData.observaciones,
        // Campos opcionales de persona para crear si no existe
        nom_persona: formData.nom_persona,
        ape_persona: formData.ape_persona,
        tel_persona: formData.tel_persona,
        email_persona: formData.email_persona,
        dir_persona: formData.dir_persona,
        sexo_persona: formData.sexo_persona,
        fec_nacim: this.formatDateForBackend(formData.fec_nacim),
        cod_pais: formData.cod_pais,
        cod_estado: formData.cod_estado,
        cod_municipio: formData.cod_municipio,
        cod_ciudad: formData.cod_ciudad
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
          if (error.error && error.error.message) {
            errorDetail = error.error.message;
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
