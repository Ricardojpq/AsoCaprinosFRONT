import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideAngularModule, Plus, Search, Pencil, Trash, X, Save } from 'lucide-angular';

import { ClasificadorDto, CreateClasificadorDto, UpdateClasificadorDto, ClasificadorFilters } from './models/classifier.dto';
import { ClassifiersService } from './services/classifiers-service';
import { LaravelPaginationResponse } from '../../shared/models/base-catalog-entity.interface';

interface Column {
  field: string;
  header: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-classifiers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    DatePickerModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    LucideAngularModule
  ],
  templateUrl: './classifiers.html',
  styleUrl: './classifiers.css',
  providers: [MessageService, ConfirmationService]
})
export class Classifiers implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  // Icons
  plusIcon = Plus;
  searchIcon = Search;
  pencilIcon = Pencil;
  trashIcon = Trash;
  xIcon = X;
  saveIcon = Save;

  // Data
  clasificadores: any[] = [];
  
  // Forms
  clasificadorForm!: FormGroup;
  
  // UI State
  clasificadorDialog = false;
  loading = false;
  submitted = false;
  isEditMode = false;
  
  // Table configuration
  cols: Column[] = [];
  totalRecords = 0;
  perPage = 25;
  currentPage = 1;
  sortField = 'cod_clasificador';
  sortOrder: 'asc' | 'desc' = 'asc';
  globalFilterValue = '';
  
  // Options
  statusOptions = [
    { label: 'Activo', value: 'A' },
    { label: 'Inactivo', value: 'I' },
    { label: 'Suspendido', value: 'S' }
  ];

  sexoOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' }
  ];

  constructor(
    private fb: FormBuilder,
    private clasificadoresService: ClassifiersService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.initializeColumns();
    this.setupSearchDebounce();
    this.loadClasificadores();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(searchTerm => searchTerm === '' || searchTerm.length >= 1), // Permitir búsqueda con 1+ caracteres o vacío
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  private initializeForm() {
    this.clasificadorForm = this.fb.group({
      // Campos requeridos según backend
      ced_clasificador: ['', [Validators.required, Validators.maxLength(20)]],
      cod_clasificador: ['', [Validators.required, Validators.maxLength(20)]],
      
      // Campos opcionales
      fec_inicio_clasif: [''],
      nro_visitas: [0, [Validators.min(0)]],
      nro_certif_po: [0, [Validators.min(0)]],
      nro_certif_pr: [0, [Validators.min(0)]],
      nro_const_gp: [0, [Validators.min(0)]],
      nro_reb_base: [0, [Validators.min(0)]],
      stat_clasificador: ['A', [Validators.maxLength(10)]],
      is_active: [true],
      
      // Campos obligatorios de persona
      nom_persona: ['', [Validators.required, Validators.maxLength(50)]],
      ape_persona: ['', [Validators.required, Validators.maxLength(50)]],
      tel_persona: ['', [Validators.required, Validators.maxLength(20)]],
      fec_nacim: ['', [Validators.required]],
      sexo_persona: ['', [Validators.required]],
      
      // Campos opcionales de persona
      email_persona: ['', [Validators.email, Validators.maxLength(80)]],
      dir_persona: ['', [Validators.maxLength(200)]]
    });
  }

  initializeColumns() {
    this.cols = [
      { field: 'ced_clasificador', header: 'Cédula', sortable: true },
      { field: 'cod_clasificador', header: 'Código', sortable: true },
      { field: 'nom_persona', header: 'Nombre', sortable: true },
      { field: 'ape_persona', header: 'Apellido', sortable: true },
      { field: 'persona.email_persona', header: 'Email', sortable: false },
      { field: 'fec_inicio_clasif', header: 'Fecha Inicio', sortable: true },
      { field: 'nro_visitas', header: 'Visitas', sortable: true },
      { field: 'stat_clasificador', header: 'Estado', sortable: false },
      { field: 'is_active', header: 'Activo', sortable: false }
    ];
  }

  loadClasificadores(filters: ClasificadorFilters = {}) {
    this.loading = true;
    
    const allFilters = {
      ...filters,
      sort_by: this.sortField,
      sort_dir: this.sortOrder
    };

    this.clasificadoresService.getClasificadores(allFilters, this.currentPage, this.perPage)
      .subscribe({
        next: (response: LaravelPaginationResponse<ClasificadorDto>) => {
          this.clasificadores = response.data;
          this.totalRecords = response.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading clasificadores:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar clasificadores'
          });
          this.loading = false;
        }
      });
  }

  onTableLazyLoad(event: any) {
    // Evitar llamadas duplicadas
    const newPage = Math.floor(event.first / event.rows) + 1;
    const newPerPage = event.rows;
    const newSortField = event.sortField || 'cod_clasificador';
    const newSortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    
    // Solo cargar si algo cambió realmente
    if (this.currentPage !== newPage || 
        this.perPage !== newPerPage || 
        this.sortField !== newSortField || 
        this.sortOrder !== newSortOrder) {
      
      this.currentPage = newPage;
      this.perPage = newPerPage;
      this.sortField = newSortField;
      this.sortOrder = newSortOrder;
      
      this.loadClasificadores();
    }
  }

  onGlobalFilter(event: any) {
    this.globalFilterValue = event.target.value;
    this.currentPage = 1;
    // Usar el subject para debounce
    this.searchSubject.next(this.globalFilterValue);
  }

  private performSearch(searchTerm: string) {
    if (searchTerm.trim()) {
      this.searchClasificadores();
    } else {
      this.loadClasificadores();
    }
  }

  searchClasificadores() {
    if (this.globalFilterValue.trim()) {
      this.loading = true;
      this.clasificadoresService.searchClasificadores(this.globalFilterValue, this.perPage)
        .subscribe({
          next: (response: LaravelPaginationResponse<ClasificadorDto>) => {
            this.clasificadores = response.data;
            this.totalRecords = response.total;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error searching clasificadores:', error);
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
    this.currentPage = 1;
    this.searchSubject.next(''); // Usar el subject para consistencia
  }

  openNew() {
    this.isEditMode = false;
    this.clasificadorForm.reset({
      ced_clasificador: '',
      cod_clasificador: '',
      fec_inicio_clasif: new Date().toISOString().split('T')[0],
      nro_visitas: 0,
      nro_certif_po: 0,
      nro_certif_pr: 0,
      nro_const_gp: 0,
      nro_reb_base: 0,
      stat_clasificador: 'A',
      is_active: true,
      nom_persona: '',
      ape_persona: '',
      tel_persona: '',
      email_persona: '',
      dir_persona: '',
      fec_nacim: '',
      sexo_persona: ''
    });
    this.submitted = false;
    this.clasificadorDialog = true;
  }

  editClasificador(clasificador: any) {
    this.isEditMode = true;
    
    // Convertir fecha de inicio si viene en formato ISO
    let fechaInicio = clasificador.fec_inicio_clasif;
    if (fechaInicio && fechaInicio.includes('T')) {
      fechaInicio = fechaInicio.split('T')[0];
    }
    
    // Convertir fecha de nacimiento si existe
    let fechaNacimiento = '';
    if (clasificador.persona?.fnac_persona) {
      fechaNacimiento = clasificador.persona.fnac_persona.split('T')[0];
    }
    
    this.clasificadorForm.patchValue({
      ced_clasificador: clasificador.ced_clasificador,
      cod_clasificador: clasificador.cod_clasificador,
      fec_inicio_clasif: fechaInicio,
      nro_visitas: clasificador.nro_visitas || 0,
      nro_certif_po: clasificador.nro_certif_po || 0,
      nro_certif_pr: clasificador.nro_certif_pr || 0,
      nro_const_gp: clasificador.nro_const_gp || 0,
      nro_reb_base: clasificador.nro_reb_base || 0,
      stat_clasificador: clasificador.stat_clasificador,
      is_active: clasificador.is_active,
      
      // Datos de persona desde el objeto persona
      nom_persona: clasificador.persona?.nom_persona || '',
      ape_persona: clasificador.persona?.ape_persona || '',
      tel_persona: clasificador.persona?.tlf_persona || clasificador.persona?.cel_persona || '',
      email_persona: clasificador.persona?.email_persona || '',
      dir_persona: clasificador.persona?.dir_persona || '',
      fec_nacim: fechaNacimiento,
      sexo_persona: clasificador.persona?.sexo_persona || ''
    });
    this.clasificadorDialog = true;
  }

  deleteClasificador(clasificador: any) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el clasificador ${clasificador.cod_clasificador}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clasificadoresService.deleteClasificador(clasificador.ced_clasificador)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Clasificador eliminado correctamente'
              });
              this.loadClasificadores();
            },
            error: (error) => {
              console.error('Error deleting clasificador:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar clasificador'
              });
            }
          });
      }
    });
  }

  // Método eliminado - ya no se usa bulk delete

  hideDialog() {
    this.clasificadorDialog = false;
    this.submitted = false;
  }

  saveClasificador() {
    this.submitted = true;

    if (this.clasificadorForm.valid) {
      const formValue = this.clasificadorForm.value;
      
      if (this.isEditMode) {
        // Update - incluir datos de persona para actualizar
        const updateData: any = {
          cod_clasificador: formValue.cod_clasificador,
          fec_inicio_clasif: this.formatDateForBackend(formValue.fec_inicio_clasif),
          nro_visitas: formValue.nro_visitas,
          nro_certif_po: formValue.nro_certif_po,
          nro_certif_pr: formValue.nro_certif_pr,
          nro_const_gp: formValue.nro_const_gp,
          nro_reb_base: formValue.nro_reb_base,
          stat_clasificador: formValue.stat_clasificador,
          is_active: formValue.is_active,
          // Datos de persona para actualizar
          nom_persona: formValue.nom_persona,
          ape_persona: formValue.ape_persona,
          tel_persona: formValue.tel_persona,
          fec_nacim: this.formatDateForBackend(formValue.fec_nacim),
          sexo_persona: formValue.sexo_persona,
          email_persona: formValue.email_persona,
          dir_persona: formValue.dir_persona
        };

        this.clasificadoresService.updateClasificador(formValue.ced_clasificador, updateData)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Clasificador actualizado correctamente'
              });
              this.loadClasificadores();
              this.hideDialog();
            },
            error: (error) => {
              console.error('Error updating clasificador:', error);
              this.handleFormErrors(error);
            }
          });
      } else {
        // Create - incluir datos de persona para crear automáticamente si no existe
        const createData: CreateClasificadorDto = {
          ced_clasificador: formValue.ced_clasificador,
          cod_clasificador: formValue.cod_clasificador,
          fec_inicio_clasif: this.formatDateForBackend(formValue.fec_inicio_clasif, true)!,
          nro_visitas: formValue.nro_visitas || 0,
          nro_certif_po: formValue.nro_certif_po || 0,
          nro_certif_pr: formValue.nro_certif_pr || 0,
          nro_const_gp: formValue.nro_const_gp || 0,
          nro_reb_base: formValue.nro_reb_base || 0,
          stat_clasificador: formValue.stat_clasificador,
          is_active: formValue.is_active,
          // Datos obligatorios de persona
          nom_persona: formValue.nom_persona,
          ape_persona: formValue.ape_persona,
          tel_persona: formValue.tel_persona,
          fec_nacim: this.formatDateForBackend(formValue.fec_nacim),
          sexo_persona: formValue.sexo_persona,
          // Datos opcionales de persona
          email_persona: formValue.email_persona,
          dir_persona: formValue.dir_persona
        };

        this.clasificadoresService.createClasificador(createData)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Clasificador creado correctamente'
              });
              this.loadClasificadores();
              this.hideDialog();
            },
            error: (error) => {
              console.error('Error creating clasificador:', error);
              this.handleFormErrors(error);
            }
          });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleFormErrors(error: any) {
    let errorMessage = 'Error al procesar la solicitud';
    
    if (error.error && error.error.data) {
      // Errores de validación del backend
      const validationErrors = error.error.data;
      const firstError = Object.values(validationErrors)[0] as string[];
      if (firstError && firstError.length > 0) {
        errorMessage = firstError[0];
      }
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.clasificadorForm.controls).forEach(key => {
      const control = this.clasificadorForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para acceso fácil a los controls del formulario
  get f() { return this.clasificadorForm.controls; }

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

  // Métodos de validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.clasificadorForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.clasificadorForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched || this.submitted)) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} debe ser mayor o igual a ${field.errors['min'].min}`;
      }
      if (field.errors['email']) {
        return 'El formato del email no es válido';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'ced_clasificador': 'La cédula',
      'cod_clasificador': 'El código',
      'fec_inicio_clasif': 'La fecha de inicio',
      'nro_visitas': 'El número de visitas',
      'nro_certif_po': 'El número de certificados PO',
      'nro_certif_pr': 'El número de certificados PR',
      'nro_const_gp': 'El número de constancias GP',
      'nro_reb_base': 'El número de rebaños base',
      'stat_clasificador': 'El estado',
      'nom_persona': 'El nombre',
      'ape_persona': 'El apellido',
      'tel_persona': 'El teléfono',
      'fec_nacim': 'La fecha de nacimiento',
      'sexo_persona': 'El sexo',
      'email_persona': 'El email',
      'dir_persona': 'La dirección'
    };
    return labels[fieldName] || 'El campo';
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    switch (status) {
      case 'A': return 'success';
      case 'I': return 'secondary';
      case 'S': return 'warning';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'A': return 'Activo';
      case 'I': return 'Inactivo';
      case 'S': return 'Suspendido';
      default: return status;
    }
  }
}
