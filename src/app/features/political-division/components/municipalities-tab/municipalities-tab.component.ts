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
  MunicipioDto,
  MunicipioCreateDto,
  MunicipioUpdateDto,
  MunicipioQueryParams,
  EstadoDto,
  PaisDto,
  PoliticalDivisionListResponse,
  PoliticalDivisionSelectOption,
} from '../../models/political-division.dto';

// Interfaz extendida para opciones con filtrado jerárquico
interface ExtendedSelectOption extends PoliticalDivisionSelectOption {
  cod_pais?: number;
}

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BrushCleaning, LucideAngularModule, Pencil, Plus, RotateCcw, Search, Trash } from 'lucide-angular';

@Component({
  selector: 'app-municipalities-tab',
  templateUrl: './municipalities-tab.component.html',
  styleUrls: ['./municipalities-tab.component.css'],
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
export class MunicipalitiesTabComponent implements OnInit, OnChanges {
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
  municipalities: MunicipioDto[] = [];
  totalRecords: number = 0;
  loading: boolean = false;

  // ============= PAGINACIÓN =============
  first: number = 0;
  rows: number = 10;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];

  // ============= BÚSQUEDA Y FILTROS =============
  searchTerm: string = '';
  sortField: string = 'nom_municipio';
  sortOrder: number = 1;

  // ============= MODAL =============
  displayModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  municipalityForm!: FormGroup;
  selectedMunicipalityForEdit: MunicipioDto | null = null;

  // ============= OPCIONES PARA FORMULARIOS =============
  countryOptions: PoliticalDivisionSelectOption[] = [];
  stateOptions: PoliticalDivisionSelectOption[] = [];
  allStateOptions: ExtendedSelectOption[] = []; // Para almacenar todos los estados con cod_pais

  // ============= OPCIONES PARA DROPDOWNS =============
  cityOptions: PoliticalDivisionSelectOption[] = [];

  constructor(
    private politicalDivisionService: PoliticalDivisionService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadMunicipalities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Componente independiente sin filtros jerárquicos
  }

  // ============= INICIALIZACIÓN =============

  /**
   * Inicializar formulario reactivo
   */
  initializeForm(): void {
    this.municipalityForm = this.fb.group({
      cod_municipio: ['', [Validators.required, Validators.min(1)]],
      nom_municipio: ['', [Validators.required, Validators.maxLength(100)]],
      cod_pais: ['', [Validators.required]], // Campo para seleccionar país
      cod_estado: ['', [Validators.required]],
      capital_municipio: ['', [Validators.maxLength(50)]],
    });
  }

  // ============= CARGA DE DATOS =============

  /**
   * Cargar opciones de países para el formulario
   */
  loadCountryOptions(): void {
    this.politicalDivisionService
      .getPaises({ page: 1, per_page: 100 })
      .subscribe({
        next: (response: PoliticalDivisionListResponse<PaisDto>) => {
          this.countryOptions = response.message.data.map((country) => ({
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
   * Cargar estados filtrados por país seleccionado
   */
  onCountryChange(selectedCountryCode: number): void {
    if (selectedCountryCode) {
      // Cargar estados filtrados por cod_pais usando el backend
      this.politicalDivisionService
        .getEstados({
          page: 1,
          per_page: 100,
          cod_pais: selectedCountryCode, // Filtrar por país en el backend
        })
        .subscribe({
          next: (response: PoliticalDivisionListResponse<EstadoDto>) => {
            this.stateOptions = response.message.data.map((state) => ({
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

    // Limpiar selección de estado cuando cambia el país
    this.municipalityForm.patchValue({ cod_estado: '' });
  }

  loadMunicipalities(event?: any): void {
    this.loading = true;

    // Actualizar parámetros de paginación y sorting
    if (event) {
      this.first = event.first || 0;
      this.rows = event.rows || 10;
      this.sortField = event.sortField || 'nom_municipio';
      this.sortOrder = event.sortOrder || 1;
    }

    const params: MunicipioQueryParams = {
      page: Math.floor(this.first / this.rows) + 1,
      per_page: this.rows,
      nom_municipio: this.searchTerm.trim() || undefined,
      sort_by: this.getSortField(),
      sort_dir: this.sortOrder === 1 ? 'asc' : 'desc',
    };

    this.politicalDivisionService.getMunicipios(params).subscribe({
      next: (response: PoliticalDivisionListResponse<MunicipioDto>) => {
        this.municipalities = response.message.data;
        this.totalRecords = response.message.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading municipalities:', error);
        this.loading = false;
      },
    });
  }

  /**
   * Obtener campo de ordenamiento válido
   */
  private getSortField(): 'cod_municipio' | 'nom_municipio' | 'cod_estado' {
    const validFields = ['cod_municipio', 'nom_municipio', 'cod_estado'];
    return validFields.includes(this.sortField)
      ? (this.sortField as any)
      : 'nom_municipio';
  }

  // ============= EVENTOS DE TABLA =============

  onSearch(): void {
    this.first = 0;
    this.loadMunicipalities();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  onRowSelect(event: any): void {
    // Fila seleccionada para futuras funcionalidades
  }

  // ============= MODAL CRUD =============

  /**
   * Abrir modal para crear nuevo municipio
   */
  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedMunicipalityForEdit = null;
    this.municipalityForm.reset();

    // Solo cargar países inicialmente
    this.loadCountryOptions();

    // Limpiar opciones dependientes
    this.stateOptions = [];
    this.allStateOptions = []; // También limpiar el cache

    this.displayModal = true;
  }

  /**
   * Abrir modal para editar municipio
   */
  openEditModal(municipality: MunicipioDto): void {
    this.modalMode = 'edit';
    this.selectedMunicipalityForEdit = municipality;

    this.loadCountryOptions();

    // Por ahora, solo establecer los valores básicos
    // TODO: Implementar preselección jerárquica cuando el servicio tenga getMunicipio
    this.municipalityForm.patchValue({
      cod_municipio: municipality.cod_municipio,
      nom_municipio: municipality.nom_municipio,
      cod_estado: municipality.cod_estado,
      capital_municipio: municipality.capital_municipio || '',
    });

    this.displayModal = true;
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.displayModal = false;
    this.municipalityForm.reset();
    this.selectedMunicipalityForEdit = null;
  }

  /**
   * Guardar municipio (crear o actualizar)
   */
  saveMunicipality(): void {
    if (this.municipalityForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.municipalityForm.value;
    this.loading = true;

    if (this.modalMode === 'create') {
      const createDto: MunicipioCreateDto = {
        cod_municipio: formValue.cod_municipio,
        nom_municipio: formValue.nom_municipio,
        cod_estado: formValue.cod_estado,
        capital_municipio: formValue.capital_municipio || undefined,
      };

      this.politicalDivisionService.createMunicipio(createDto).subscribe({
        next: (response) => {
          this.loading = false;
          this.closeModal();
          this.loadMunicipalities();
          this.dataChanged.emit();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating municipality:', error);
        },
      });
    } else {
      const updateDto: MunicipioUpdateDto = {
        nom_municipio: formValue.nom_municipio,
        cod_estado: formValue.cod_estado,
        capital_municipio: formValue.capital_municipio || undefined,
      };

      this.politicalDivisionService
        .updateMunicipio(
          this.selectedMunicipalityForEdit!.cod_municipio,
          updateDto
        )
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.closeModal();
            this.loadMunicipalities();
            this.dataChanged.emit();
          },
          error: (error) => {
            this.loading = false;
            console.error('Error updating municipality:', error);
          },
        });
    }
  }

  /**
   * Confirmar eliminación de municipio
   */
  confirmDelete(municipality: MunicipioDto): void {
    if (
      confirm(
        `¿Está seguro de eliminar el municipio "${municipality.nom_municipio}"?`
      )
    ) {
      this.deleteMunicipality(municipality);
    }
  }

  /**
   * Eliminar municipio
   */
  private deleteMunicipality(municipality: MunicipioDto): void {
    this.loading = true;

    this.politicalDivisionService
      .deleteMunicipio(municipality.cod_municipio)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.loadMunicipalities();
          this.dataChanged.emit();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error deleting municipality:', error);
        },
      });
  }

  // ============= GETTERS PARA TEMPLATE =============

  get filteredStateOptions(): PoliticalDivisionSelectOption[] {
    return this.stateOptions;
  }

  // ============= UTILIDADES =============

  /**
   * Marcar todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.municipalityForm.controls).forEach((key) => {
      const control = this.municipalityForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.municipalityForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtener mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.municipalityForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength'])
        return `${fieldName} excede la longitud máxima`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a 0`;
    }
    return '';
  }
}
