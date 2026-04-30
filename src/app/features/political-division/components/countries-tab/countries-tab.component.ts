import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BaseComponent } from '@core/components/base.component';
import { PoliticalDivisionService } from '../../Services/political-division-service';
import { 
  PaisDto, 
  PaisCreateDto, 
  PaisUpdateDto, 
  PaisQueryParams,
  PoliticalDivisionSelectOption
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

@Component({
  selector: 'app-countries-tab',
  templateUrl: './countries-tab.component.html',
  styleUrls: ['./countries-tab.component.css'],
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
  ]
})
export class CountriesTabComponent extends BaseComponent implements OnInit, OnChanges {
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
  countries: PaisDto[] = [];
  totalRecords: number = 0;
  loading: boolean = false;

  // ============= PAGINACIÓN =============
  first: number = 0;
  rows: number = 10;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];

  // ============= BÚSQUEDA Y FILTROS =============
  searchTerm: string = '';
  sortField: string = 'nom_pais';
  sortOrder: number = 1; // 1 = asc, -1 = desc

  // ============= MODAL =============
  displayModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  countryForm!: FormGroup;
  selectedCountryForEdit: PaisDto | null = null;


  constructor(
    private politicalDivisionService: PoliticalDivisionService,
    private fb: FormBuilder
  ) {
    super();
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCountries();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Componente independiente sin filtros jerárquicos
  }

  // ============= INICIALIZACIÓN =============

  /**
   * Inicializar formulario reactivo
   */
  initializeForm(): void {
    this.countryForm = this.fb.group({
      cod_pais: ['', [Validators.required, Validators.min(1)]],
      nom_pais: ['', [Validators.required, Validators.maxLength(100)]],
      siglas_pais: ['', [Validators.maxLength(10)]],
      capital_pais: ['', [Validators.maxLength(50)]]
    });
  }

  // ============= CARGA DE DATOS =============

  // ============= EVENTOS DE TABLA =============

  /**
   * Manejar búsqueda
   */
  onSearch(): void {
    this.first = 0; // Resetear a la primera página
    this.loadCountries();
  }

  /**
   * Limpiar búsqueda
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  /**
   * Manejar selección de fila
   */
  onRowSelect(event: any): void {
    // Fila seleccionada para futuras funcionalidades
  }

  /**
   * Obtener campo de ordenamiento para el backend
   */
  private getSortField(): 'cod_pais' | 'nom_pais' | 'siglas_pais' {
    switch (this.sortField) {
      case 'cod_pais': return 'cod_pais';
      case 'siglas_pais': return 'siglas_pais';
      default: return 'nom_pais';
    }
  }

  // ============= MODAL CRUD =============

  /**
   * Abrir modal para crear nuevo país
   */
  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedCountryForEdit = null;
    this.countryForm.reset();
    this.displayModal = true;
  }

  /**
   * Abrir modal para editar país
   */
  openEditModal(country: PaisDto): void {
    this.modalMode = 'edit';
    this.selectedCountryForEdit = country;
    
    // Llenar formulario con datos del país
    this.countryForm.patchValue({
      cod_pais: country.cod_pais,
      nom_pais: country.nom_pais,
      siglas_pais: country.siglas_pais || '',
      capital_pais: country.capital_pais || ''
    });
    
    this.displayModal = true;
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.displayModal = false;
    this.countryForm.reset();
    this.selectedCountryForEdit = null;
  }

  /**
   * Guardar país (crear o actualizar)
   */
  saveCountry(): void {
    if (this.countryForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.countryForm.value;
    this.loading = true;

    if (this.modalMode === 'create') {
      // Crear nuevo país
      const createDto: PaisCreateDto = {
        cod_pais: formValue.cod_pais,
        nom_pais: formValue.nom_pais,
        siglas_pais: formValue.siglas_pais || undefined,
        capital_pais: formValue.capital_pais || undefined
      };

      this.politicalDivisionService.createCountry(createDto).pipe(this.untilDestroyed()).subscribe({
        next: (response) => {
          this.loading = false;
          this.closeModal();
          this.loadCountries();
          this.dataChanged.emit();
          // TODO: Mostrar mensaje de éxito
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating country:', error);
          // TODO: Mostrar mensaje de error
        }
      });
    } else {
      // Actualizar país existente
      const updateDto: PaisUpdateDto = {
        nom_pais: formValue.nom_pais,
        siglas_pais: formValue.siglas_pais || undefined,
        capital_pais: formValue.capital_pais || undefined
      };

      this.politicalDivisionService.updateCountry(this.selectedCountryForEdit!.cod_pais, updateDto).pipe(this.untilDestroyed()).subscribe({
        next: (response) => {
          this.loading = false;
          this.closeModal();
          this.loadCountries();
          this.dataChanged.emit();
          // TODO: Mostrar mensaje de éxito
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating country:', error);
          // TODO: Mostrar mensaje de error
        }
      });
    }
  }

  /**
   * Eliminar país
   */
  deleteCountry(country: PaisDto): void {
    // TODO: Mostrar confirmación
    if (confirm(`¿Está seguro de eliminar el país "${country.nom_pais}"?`)) {
      this.loading = true;
      
      this.politicalDivisionService.deleteCountry(country.cod_pais).pipe(this.untilDestroyed()).subscribe({
        next: (response) => {
          this.loading = false;
          this.loadCountries();
          this.dataChanged.emit();
          // TODO: Mostrar mensaje de éxito
        },
        error: (error) => {
          this.loading = false;
          console.error('Error deleting country:', error);
          // TODO: Mostrar mensaje de error
        }
      });
    }
  }

  // ============= UTILIDADES =============

  /**
   * Marcar todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.countryForm.controls).forEach(key => {
      const control = this.countryForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.countryForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtener mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.countryForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength']) return `${fieldName} excede la longitud máxima`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a 0`;
    }
    return '';
  }

  /**
   * Cargar países con paginación, filtros y sorting
   */
  loadCountries(event?: any): void {
    this.loading = true;
    
    // Actualizar parámetros de paginación y sorting
    if (event) {
      this.first = event.first || 0;
      this.rows = event.rows || 10;
      this.sortField = event.sortField || 'nom_pais';
      this.sortOrder = event.sortOrder || 1;
    }

    const params: PaisQueryParams = {
      page: Math.floor(this.first / this.rows) + 1,
      per_page: this.rows,
      nom_pais: this.searchTerm.trim() || undefined,
      sort_by: this.getSortField(),
      sort_dir: this.sortOrder === 1 ? 'asc' : 'desc'
    };

    this.politicalDivisionService.getCountries(params).pipe(this.untilDestroyed()).subscribe({
      next: (response) => {
        this.countries = response.data.data;
        this.totalRecords = response.data.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.loading = false;
      }
    });
  }



  /**
   * Confirmar eliminación de país
   */
  confirmDelete(country: PaisDto): void {
    this.deleteCountry(country);
  }
}
