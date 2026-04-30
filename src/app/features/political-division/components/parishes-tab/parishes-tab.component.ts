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
import { BaseComponent } from '@core/components/base.component';
import { PoliticalDivisionService } from '../../Services/political-division-service';
import {
  ParroquiaDto,
  ParroquiaCreateDto,
  ParroquiaUpdateDto,
  ParroquiaQueryParams,
  MunicipioDto,
  EstadoDto,
  PaisDto,
  PoliticalDivisionSelectOption,
} from '../../models/political-division.dto';

// Interfaz extendida para opciones con filtrado jerárquico
interface ExtendedSelectOption extends PoliticalDivisionSelectOption {
  cod_pais?: number;
  cod_estado?: number;
}

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
  BrushCleaning,
  LucideAngularModule,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash,
} from 'lucide-angular';
import { LaravelApiResponse } from '@core/models/DTOs';

@Component({
  selector: 'app-parishes-tab',
  templateUrl: './parishes-tab.component.html',
  styleUrls: ['./parishes-tab.component.css'],
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
    LucideAngularModule,
  ],
})
export class ParishesTabComponent extends BaseComponent implements OnInit, OnChanges {
  readonly searchIcon = Search;
  readonly brushCleaningIcon = BrushCleaning;
  readonly plusIcon = Plus;
  readonly rotateCcwIcon = RotateCcw;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash;

  // ============= INPUTS =============
  @Input() canCreate: boolean = true; // CRUD completo
  @Input() canUpdate: boolean = true; // CRUD completo
  @Input() canDelete: boolean = true; // CRUD completo

  // ============= OUTPUTS =============
  @Output() dataChanged = new EventEmitter<void>();

  // ============= DATOS =============
  parishes: ParroquiaDto[] = [];
  totalRecords: number = 0;
  loading: boolean = false;
  selectedParish: ParroquiaDto | null = null;

  // ============= PAGINACIÓN =============
  first: number = 0;
  rows: number = 10;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];

  // ============= BÚSQUEDA Y FILTROS =============
  searchTerm: string = '';
  sortField: string = 'nom_parroquia';
  sortOrder: number = 1;

  // ============= MODAL =============
  displayModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  parishForm!: FormGroup;
  selectedParishForEdit: ParroquiaDto | null = null;

  // ============= OPCIONES PARA FORMULARIOS =============
  countryOptions: PoliticalDivisionSelectOption[] = [];
  stateOptions: PoliticalDivisionSelectOption[] = [];
  municipalityOptions: PoliticalDivisionSelectOption[] = [];

  // Para almacenar todas las opciones para filtrado
  allStateOptions: ExtendedSelectOption[] = [];
  allMunicipalityOptions: ExtendedSelectOption[] = [];

  constructor(
    private politicalDivisionService: PoliticalDivisionService,
    private fb: FormBuilder
  ) {
    super();
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadParishes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Componente independiente sin filtros jerárquicos
  }

  // ============= CARGA DE DATOS =============

  /**
   * Cargar opciones de países para el formulario
   */
  loadCountryOptions(): void {
    this.politicalDivisionService
      .getCountries({ page: 1, per_page: 100 })
      .pipe(this.untilDestroyed()).subscribe({
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
   * Cargar todas las opciones de estados para filtrado posterior
   */
  loadAllStateOptions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.politicalDivisionService
        .getStates({ page: 1, per_page: 100 })
        .pipe(this.untilDestroyed()).subscribe({
          next: (response: LaravelApiResponse<EstadoDto>) => {
            this.allStateOptions = response.data.data.map((state) => ({
              label: state.nom_estado,
              value: state.cod_estado,
              cod_pais: state.cod_pais,
            }));
            resolve();
          },
          error: (error: any) => {
            console.error('Error loading all states:', error);
            reject(error);
          },
        });
    });
  }

  /**
   * Cargar todas las opciones de municipios para filtrado posterior
   */
  loadAllMunicipalityOptions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.politicalDivisionService
        .getMunicipalities({ page: 1, per_page: 100 })
        .pipe(this.untilDestroyed()).subscribe({
          next: (response: LaravelApiResponse<MunicipioDto>) => {
            this.allMunicipalityOptions = response.data.data.map(
              (municipality) => ({
                label: municipality.nom_municipio,
                value: municipality.cod_municipio,
                cod_estado: municipality.cod_estado,
              })
            );
            resolve();
          },
          error: (error: any) => {
            console.error('Error loading all municipalities:', error);
            reject(error);
          },
        });
    });
  }

  /**
   * Cargar estados filtrados por país seleccionado
   */
  onCountryChange(selectedCountryCode: number): void {
    if (selectedCountryCode) {
      // Cargar estados filtrados por cod_pais usando el backend
      this.politicalDivisionService
        .getStates({
          page: 1,
          per_page: 100,
          cod_pais: selectedCountryCode, // Filtrar por país en el backend
        })
        .pipe(this.untilDestroyed()).subscribe({
          next: (response: LaravelApiResponse<EstadoDto>) => {
            this.stateOptions = response.data.data.map((state) => ({
              label: state.nom_estado,
              value: state.cod_estado,
            }));
          },
          error: (error: any) => {
            console.error('Error loading states for country:', error);
            this.stateOptions = [];
          },
        });
    } else {
      this.stateOptions = [];
    }

    // Limpiar selecciones dependientes
    this.municipalityOptions = [];
    this.parishForm.patchValue({
      cod_estado: '',
      cod_municipio: '',
    });
  }

  /**
   * Cargar municipios filtrados por estado seleccionado
   */
  onStateChange(selectedStateCode: number): void {
    if (selectedStateCode) {
      // Cargar municipios filtrados por cod_estado usando el backend
      this.politicalDivisionService
        .getMunicipalities({
          page: 1,
          per_page: 100,
          cod_estado: selectedStateCode, // Filtrar por estado en el backend
        })
        .pipe(this.untilDestroyed()).subscribe({
          next: (response: LaravelApiResponse<MunicipioDto>) => {
            this.municipalityOptions = response.data.data.map(
              (municipality) => ({
                label: municipality.nom_municipio,
                value: municipality.cod_municipio,
              })
            );
          },
          error: (error: any) => {
            console.error('Error loading municipalities for state:', error);
            this.municipalityOptions = [];
          },
        });
    } else {
      this.municipalityOptions = [];
    }

    // Limpiar selección de municipio
    this.parishForm.patchValue({ cod_municipio: '' });
  }

  loadParishes(event?: any): void {
    this.loading = true;

    // Actualizar parámetros de paginación y sorting
    if (event) {
      this.first = event.first || 0;
      this.rows = event.rows || 10;
      this.sortField = event.sortField || 'nom_parroquia';
      this.sortOrder = event.sortOrder || 1;
    }

    const params: ParroquiaQueryParams = {
      page: Math.floor(this.first / this.rows) + 1,
      per_page: this.rows,
      nom_parroquia: this.searchTerm.trim() || undefined,
      sort_by: this.getSortField(),
      sort_dir: this.sortOrder === 1 ? 'asc' : 'desc',
    };

    this.politicalDivisionService.getParishes(params).pipe(this.untilDestroyed()).subscribe({
      next: (response: LaravelApiResponse<ParroquiaDto>) => {
        this.parishes = response.data.data;
        this.totalRecords = response.data.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading parishes:', error);
        this.loading = false;
      },
    });
  }

  /**
   * Obtener campo de ordenamiento válido
   */
  private getSortField(): 'cod_parroquia' | 'nom_parroquia' | 'cod_municipio' {
    const validFields = ['cod_parroquia', 'nom_parroquia', 'cod_municipio'];
    return validFields.includes(this.sortField)
      ? (this.sortField as any)
      : 'nom_parroquia';
  }

  // ============= EVENTOS DE TABLA =============

  onSearch(): void {
    this.first = 0;
    this.loadParishes();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  onRowSelect(event: any): void {
    this.selectedParish = event.data;
  }

  // ============= INICIALIZACIÓN =============

  /**
   * Inicializar formulario reactivo
   */
  initializeForm(): void {
    this.parishForm = this.fb.group({
      cod_parroquia: ['', [Validators.required, Validators.min(1)]],
      nom_parroquia: ['', [Validators.required, Validators.maxLength(100)]],
      cod_pais: ['', [Validators.required]], // Campo para seleccionar país
      cod_estado: ['', [Validators.required]], // Campo para seleccionar estado
      cod_municipio: ['', [Validators.required]],
    });
  }

  // ============= MODAL CRUD =============

  /**
   * Abrir modal para crear nueva parroquia
   */
  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedParishForEdit = null;
    this.parishForm.reset();

    // Solo cargar países inicialmente
    this.loadCountryOptions();

    // Limpiar opciones dependientes y cache
    this.stateOptions = [];
    this.municipalityOptions = [];
    this.allStateOptions = [];
    this.allMunicipalityOptions = [];

    this.displayModal = true;
  }

  /**
   * Abrir modal para editar parroquia
   */
  openEditModal(parish: ParroquiaDto): void {
    this.modalMode = 'edit';
    this.selectedParishForEdit = parish;

    this.loadCountryOptions();
    this.loadAllStateOptions();
    this.loadAllMunicipalityOptions();

    // Por ahora, solo establecer los valores básicos
    // TODO: Implementar preselección jerárquica cuando el servicio tenga getMunicipio
    this.parishForm.patchValue({
      cod_parroquia: parish.cod_parroquia,
      nom_parroquia: parish.nom_parroquia,
      cod_municipio: parish.cod_municipio,
    });

    this.displayModal = true;
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.displayModal = false;
    this.parishForm.reset();
    this.selectedParishForEdit = null;
  }

  /**
   * Guardar parroquia (crear o actualizar)
   */
  saveParish(): void {
    if (this.parishForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.parishForm.value;
    this.loading = true;

    if (this.modalMode === 'create') {
      const createDto: ParroquiaCreateDto = {
        cod_parroquia: formValue.cod_parroquia,
        nom_parroquia: formValue.nom_parroquia,
        cod_municipio: formValue.cod_municipio,
      };

      this.politicalDivisionService.createParish(createDto).pipe(this.untilDestroyed()).subscribe({
        next: (response) => {
          this.loading = false;
          this.closeModal();
          this.loadParishes();
          this.dataChanged.emit();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating parish:', error);
        },
      });
    } else {
      const updateDto: ParroquiaUpdateDto = {
        nom_parroquia: formValue.nom_parroquia,
        cod_municipio: formValue.cod_municipio,
      };

      this.politicalDivisionService
        .updateParish(this.selectedParishForEdit!.cod_parroquia, updateDto)
        .pipe(this.untilDestroyed()).subscribe({
          next: (response) => {
            this.loading = false;
            this.closeModal();
            this.loadParishes();
            this.dataChanged.emit();
          },
          error: (error) => {
            this.loading = false;
            console.error('Error updating parish:', error);
          },
        });
    }
  }

  /**
   * Confirmar eliminación de parroquia
   */
  confirmDelete(parish: ParroquiaDto): void {
    if (
      confirm(
        `¿Está seguro de eliminar la parroquia "${parish.nom_parroquia}"?`
      )
    ) {
      this.deleteParish(parish);
    }
  }

  /**
   * Eliminar parroquia
   */
  private deleteParish(parish: ParroquiaDto): void {
    this.loading = true;

    this.politicalDivisionService
      .deleteParish(parish.cod_parroquia)
      .pipe(this.untilDestroyed()).subscribe({
        next: (response) => {
          this.loading = false;
          this.loadParishes();
          this.dataChanged.emit();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error deleting parish:', error);
        },
      });
  }

  // ============= GETTERS PARA TEMPLATE =============

  get filteredMunicipalityOptions(): PoliticalDivisionSelectOption[] {
    return this.municipalityOptions;
  }

  // ============= UTILIDADES =============

  /**
   * Marcar todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.parishForm.controls).forEach((key) => {
      const control = this.parishForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.parishForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtener mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.parishForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength'])
        return `${fieldName} excede la longitud máxima`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a 0`;
    }
    return '';
  }
}
