import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { PoliticalDivisionService } from '../../Services/political-division-service';
import {
  PaisDto,
  EstadoDto,
  EstadoCreateDto,
  EstadoUpdateDto,
  EstadoQueryParams,
  PoliticalDivisionSelectOption,
} from '../../models/political-division.dto';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BrushCleaning, LucideAngularModule, Pencil, Plus, RotateCcw, Search, Trash } from 'lucide-angular';
import { LaravelApiResponse, LaravelPaginationResponse } from '@core/models/DTOs';

@Component({
  selector: 'app-states-tab',
  templateUrl: './states-tab.component.html',
  styleUrls: ['./states-tab.component.css'],
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    TooltipModule,
    LucideAngularModule
  ],
})
export class StatesTabComponent implements OnInit, OnChanges {
  readonly searchIcon = Search;
  readonly brushCleaningIcon = BrushCleaning;
  readonly plusIcon = Plus;
  readonly rotateCcwIcon = RotateCcw;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash;

  // ============= INPUTS =============
  @Input() canCreate: boolean = true;
  @Input() canUpdate: boolean = true;
  @Input() canDelete: boolean = true;

  // ============= OUTPUTS =============
  @Output() dataChanged = new EventEmitter<void>();

  // ============= DATOS =============
  states: EstadoDto[] = [];
  totalRecords: number = 0;
  loading: boolean = false;

  // ============= PAGINACIÓN =============
  first: number = 0;
  rows: number = 10;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];

  // ============= BÚSQUEDA Y FILTROS =============
  searchTerm: string = '';
  sortField: string = 'nom_estado';
  sortOrder: number = 1;

  // ============= MODAL =============
  displayModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  stateForm!: FormGroup;
  selectedStateForEdit: EstadoDto | null = null;

  // ============= OPCIONES PARA FORMULARIOS =============
  countryOptions: PoliticalDivisionSelectOption[] = [];

  constructor(
    private politicalDivisionService: PoliticalDivisionService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadStates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Componente independiente sin filtros jerárquicos
  }

  // ============= INICIALIZACIÓN =============

  initializeForm(): void {
    this.stateForm = this.fb.group({
      cod_estado: ['', [Validators.required, Validators.min(1)]],
      nom_estado: ['', [Validators.required, Validators.maxLength(100)]],
      siglas_estado: ['', [Validators.maxLength(10)]],
      cod_pais: ['', [Validators.required]],
      capital_estado: ['', [Validators.maxLength(50)]],
    });
  }

  // ============= CARGA DE DATOS =============

  // ============= EVENTOS DE TABLA =============

  onSearch(): void {
    this.first = 0;
    this.loadStates();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  // ============= MODAL CRUD =============

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedStateForEdit = null;
    this.stateForm.reset();
    this.loadCountryOptions();
    this.displayModal = true;
  }

  openEditModal(state: EstadoDto): void {
    this.modalMode = 'edit';
    this.selectedStateForEdit = state;

    this.loadCountryOptions();

    this.stateForm.patchValue({
      cod_estado: state.cod_estado,
      nom_estado: state.nom_estado,
      siglas_estado: state.siglas_estado || '',
      cod_pais: state.cod_pais,
      capital_estado: state.capital_estado || '',
    });

    this.displayModal = true;
  }

  closeModal(): void {
    this.displayModal = false;
    this.stateForm.reset();
    this.selectedStateForEdit = null;
  }

  saveState(): void {
    if (this.stateForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.stateForm.value;
    this.loading = true;

    if (this.modalMode === 'create') {
      const createDto: EstadoCreateDto = {
        cod_estado: formValue.cod_estado,
        nom_estado: formValue.nom_estado,
        siglas_estado: formValue.siglas_estado || undefined,
        cod_pais: formValue.cod_pais,
        capital_estado: formValue.capital_estado || undefined,
      };

      this.politicalDivisionService.createEstado(createDto).subscribe({
        next: (response) => {
          this.loading = false;
          this.closeModal();
          this.loadStates();
          this.dataChanged.emit();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating state:', error);
        },
      });
    } else {
      const updateDto: EstadoUpdateDto = {
        nom_estado: formValue.nom_estado,
        siglas_estado: formValue.siglas_estado || undefined,
        cod_pais: formValue.cod_pais,
        capital_estado: formValue.capital_estado || undefined,
      };

      this.politicalDivisionService
        .updateEstado(this.selectedStateForEdit!.cod_estado, updateDto)
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.closeModal();
            this.loadStates();
            this.dataChanged.emit();
          },
          error: (error) => {
            this.loading = false;
            console.error('Error updating state:', error);
          },
        });
    }
  }

  deleteState(state: EstadoDto): void {
    if (confirm(`¿Está seguro de eliminar el estado "${state.nom_estado}"?`)) {
      this.loading = true;

      this.politicalDivisionService.deleteEstado(state.cod_estado).subscribe({
        next: (response) => {
          this.loading = false;
          this.loadStates();
          this.dataChanged.emit();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error deleting state:', error);
        },
      });
    }
  }

  // ============= UTILIDADES =============

  private markFormGroupTouched(): void {
    Object.keys(this.stateForm.controls).forEach((key) => {
      const control = this.stateForm.get(key);
      control?.markAsTouched();
    });
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.stateForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.stateForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength'])
        return `${fieldName} excede la longitud máxima`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a 0`;
    }
    return '';
  }

  // ============= GETTERS PARA TEMPLATE =============

  get filteredCountryOptions(): PoliticalDivisionSelectOption[] {
    return this.countryOptions;
  }

  /**
   * Cargar opciones de países para el formulario
   */
  loadCountryOptions(): void {
    this.politicalDivisionService
      .getPaises({ page: 1, per_page: 100 })
      .subscribe({
        next: (response: LaravelApiResponse<PaisDto>) => {
          this.countryOptions = response.data.data.map((country) => ({
            label: country.nom_pais,
            value: country.cod_pais,
          }));
        },
        error: (error: any) => {
          console.error('Error loading countries:', error);
        },
      });
  }

  /**
   * Manejar lazy loading de la tabla con sorting
   */
  loadStates(event?: any): void {
    this.loading = true;

    // Actualizar parámetros de paginación y sorting
    if (event) {
      this.first = event.first || 0;
      this.rows = event.rows || 10;
      this.sortField = event.sortField || 'nom_estado';
      this.sortOrder = event.sortOrder || 1;
    }

    const params: EstadoQueryParams = {
      page: Math.floor(this.first / this.rows) + 1,
      per_page: this.rows,
      nom_estado: this.searchTerm.trim() || undefined,
      sort_by: this.getSortField(),
      sort_dir: this.sortOrder === 1 ? 'asc' : 'desc',
    };

    this.politicalDivisionService.getEstados(params).subscribe({
      next: ({data}) => {
        this.states = data.data;
        this.totalRecords = data.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.loading = false;
      },
    });
  }

  /**
   * Obtener campo de ordenamiento válido
   */
  private getSortField(): 'cod_estado' | 'nom_estado' | 'cod_pais' {
    const validFields = ['cod_estado', 'nom_estado', 'cod_pais'];
    return validFields.includes(this.sortField)
      ? (this.sortField as any)
      : 'nom_estado';
  }

  /**
   * Confirmar eliminación de estado
   */
  confirmDelete(state: EstadoDto): void {
    this.deleteState(state);
  }
}
