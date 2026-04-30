import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BaseComponent } from '@core/components/base.component';
import { PoliticalDivisionService } from '../../Services/political-division-service';
import { 
  CiudadDto, 
  CiudadCreateDto,
  CiudadUpdateDto,
  CiudadQueryParams,
  MunicipioDto,
  EstadoDto,
  PaisDto,
  PoliticalDivisionSelectOption
} from '../../models/political-division.dto';

// Interfaz extendida para opciones con filtrado jerárquico y nombres
interface ExtendedSelectOption extends PoliticalDivisionSelectOption {
  cod_pais?: number;
  cod_estado?: number;
  name?: string; // Para almacenar el nombre además del value
}

// Interfaz para opciones que usan nombres como valores (para ciudades)
interface NameSelectOption {
  label: string;
  value: string; // Para ciudades usamos nombres como valores
}

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LucideAngularModule,Search,BrushCleaning,Plus,RotateCcw,Pencil,Trash  } from 'lucide-angular';
import { LaravelApiResponse } from '@core/models/DTOs';


@Component({
  selector: 'app-cities-tab',
  templateUrl: './cities-tab.component.html',
  styleUrls: ['./cities-tab.component.css'],
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
export class CitiesTabComponent extends BaseComponent implements OnInit, OnChanges {
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
  cities: CiudadDto[] = [];
  totalRecords: number = 0;
  loading: boolean = false;
  selectedCity: CiudadDto | null = null;

  // ============= PAGINACIÓN =============
  first: number = 0;
  rows: number = 10;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];

  // ============= BÚSQUEDA Y FILTROS =============
  searchTerm: string = '';
  sortField: string = 'nom_ciudad';
  sortOrder: number = 1;

  // ============= MODAL =============
  displayModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  cityForm!: FormGroup;
  selectedCityForEdit: CiudadDto | null = null;

  // ============= OPCIONES PARA FORMULARIOS =============
  countryOptions: PoliticalDivisionSelectOption[] = [];
  stateOptions: NameSelectOption[] = []; // Para ciudades usamos nombres
  municipalityOptions: NameSelectOption[] = []; // Para ciudades usamos nombres
  
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
    this.loadCities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Componente independiente sin filtros jerárquicos
  }

  // ============= CARGA DE DATOS =============

  /**
   * Cargar opciones de países para el formulario
   */
  loadCountryOptions(): void {
    this.politicalDivisionService.getCountries({ page: 1, per_page: 100 }).pipe(this.untilDestroyed()).subscribe({
      next: (response: LaravelApiResponse<PaisDto>) => {
        this.countryOptions = response.data.data.map(country => ({
          label: country.nom_pais,
          value: country.cod_pais
        }));
      },
      error: (error: any) => {
        console.error('Error loading countries:', error);
      }
    });
  }

  /**
   * Cargar todas las opciones de estados para filtrado posterior
   */
  loadAllStateOptions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.politicalDivisionService.getStates({ page: 1, per_page: 100 }).pipe(this.untilDestroyed()).subscribe({
        next: (response: LaravelApiResponse<EstadoDto>) => {
          this.allStateOptions = response.data.data.map(state => ({
            label: state.nom_estado,
            value: state.cod_estado,
            name: state.nom_estado, // Guardamos el nombre para enviar al backend
            cod_pais: state.cod_pais
          }));
          resolve();
        },
        error: (error: any) => {
          console.error('Error loading all states:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Cargar todas las opciones de municipios para filtrado posterior
   */
  loadAllMunicipalityOptions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.politicalDivisionService.getMunicipalities({ page: 1, per_page: 100 }).pipe(this.untilDestroyed()).subscribe({
        next: (response: LaravelApiResponse<MunicipioDto>) => {
          this.allMunicipalityOptions = response.data.data.map(municipality => ({
            label: municipality.nom_municipio,
            value: municipality.cod_municipio,
            name: municipality.nom_municipio, // Guardamos el nombre para enviar al backend
            cod_estado: municipality.cod_estado
          }));
          resolve();
        },
        error: (error: any) => {
          console.error('Error loading all municipalities:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Cargar estados filtrados por país seleccionado
   */
  onCountryChange(selectedCountryCode: number): void {
    if (selectedCountryCode) {
      // Cargar estados filtrados por cod_pais usando el backend
      this.politicalDivisionService.getStates({ 
        page: 1, 
        per_page: 100,
        cod_pais: selectedCountryCode // Filtrar por país en el backend
      }).pipe(this.untilDestroyed()).subscribe({
        next: (response: LaravelApiResponse<EstadoDto>) => {
          this.stateOptions = response.data.data.map(state => ({
            label: state.nom_estado,
            value: state.nom_estado // Para ciudades usamos nombres
          }));
          // Guardamos los estados para poder obtener el cod_estado después
          this.allStateOptions = response.data.data.map(state => ({
            label: state.nom_estado,
            value: state.cod_estado,
            name: state.nom_estado,
            cod_pais: state.cod_pais
          }));
        },
        error: (error: any) => {
          console.error('Error loading states for country:', error);
          this.stateOptions = [];
        }
      });
    } else {
      this.stateOptions = [];
    }
    
    // Limpiar selecciones dependientes
    this.municipalityOptions = [];
    this.cityForm.patchValue({ 
      estado_ciudad: '', 
      municipio_ciudad: '' 
    });
  }

  /**
   * Cargar municipios filtrados por estado seleccionado
   */
  onStateChange(selectedStateName: string): void {
    if (selectedStateName) {
      // Encontrar el código del estado por su nombre
      const selectedState = this.allStateOptions.find(state => state.name === selectedStateName);
      if (selectedState) {
        // Cargar municipios filtrados por cod_estado usando el backend
        this.politicalDivisionService.getMunicipalities({ 
          page: 1, 
          per_page: 100,
          cod_estado: selectedState.value // Filtrar por estado en el backend
        }).pipe(this.untilDestroyed()).subscribe({
          next: (response: LaravelApiResponse<MunicipioDto>) => {
            this.municipalityOptions = response.data.data.map(municipality => ({
              label: municipality.nom_municipio,
              value: municipality.nom_municipio // Para ciudades usamos nombres
            }));
          },
          error: (error: any) => {
            console.error('Error loading municipalities for state:', error);
            this.municipalityOptions = [];
          }
        });
      }
    } else {
      this.municipalityOptions = [];
    }
    
    // Limpiar selección de municipio
    this.cityForm.patchValue({ municipio_ciudad: '' });
  }

  loadCities(event?: any): void {
    this.loading = true;

    // Actualizar parámetros de paginación y sorting
    if (event) {
      this.first = event.first || 0;
      this.rows = event.rows || 10;
      this.sortField = event.sortField || 'nom_ciudad';
      this.sortOrder = event.sortOrder || 1;
    }

    const params: CiudadQueryParams = {
      page: Math.floor(this.first / this.rows) + 1,
      per_page: this.rows,
      nom_ciudad: this.searchTerm.trim() || undefined,
      sort_by: this.getSortField(),
      sort_dir: this.sortOrder === 1 ? 'asc' : 'desc'
    };

    this.politicalDivisionService.getCities(params).pipe(this.untilDestroyed()).subscribe({
      next: (response: LaravelApiResponse<CiudadDto>) => {
        this.cities = response.data.data;
        this.totalRecords = response.data.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Obtener campo de ordenamiento válido
   */
  private getSortField(): 'cod_ciudad' | 'nom_ciudad' | 'municipio_ciudad' {
    const validFields = ['cod_ciudad', 'nom_ciudad', 'municipio_ciudad'];
    return validFields.includes(this.sortField) ? this.sortField as any : 'nom_ciudad';
  }

  // ============= EVENTOS DE TABLA =============

  onSearch(): void {
    this.first = 0;
    this.loadCities();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  onRowSelect(event: any): void {
    this.selectedCity = event.data;
  }




  // ============= INICIALIZACIÓN =============

  /**
   * Inicializar formulario reactivo
   */
  initializeForm(): void {
    this.cityForm = this.fb.group({
      cod_ciudad: ['', [Validators.required, Validators.min(1)]],
      nom_ciudad: ['', [Validators.required, Validators.maxLength(100)]],
      cod_pais: ['', [Validators.required]], // Campo para seleccionar país (solo para filtrar)
      estado_ciudad: ['', [Validators.required]], // Nombre del estado (se envía al backend)
      municipio_ciudad: ['', [Validators.required]] // Nombre del municipio (se envía al backend)
    });
  }

  // ============= MODAL CRUD =============

  /**
   * Abrir modal para crear nueva ciudad
   */
  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedCityForEdit = null;
    this.cityForm.reset();
    
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
   * Abrir modal para editar ciudad
   */
  openEditModal(city: CiudadDto): void {
    this.modalMode = 'edit';
    this.selectedCityForEdit = city;
    
    this.loadCountryOptions();
    this.loadAllStateOptions();
    this.loadAllMunicipalityOptions();
    
    // Por ahora, solo establecer los valores básicos
    // TODO: Implementar preselección jerárquica cuando tengamos los métodos necesarios
    this.cityForm.patchValue({
      cod_ciudad: city.cod_ciudad,
      nom_ciudad: city.nom_ciudad,
      estado_ciudad: city.estado_ciudad || '',
      municipio_ciudad: city.municipio_ciudad || ''
    });
    
    this.displayModal = true;
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.displayModal = false;
    this.cityForm.reset();
    this.selectedCityForEdit = null;
  }

  /**
   * Guardar ciudad (crear o actualizar)
   */
  saveCity(): void {
    if (this.cityForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.cityForm.value;
    this.loading = true;

    if (this.modalMode === 'create') {
      const createDto: CiudadCreateDto = {
        cod_ciudad: formValue.cod_ciudad,
        nom_ciudad: formValue.nom_ciudad,
        estado_ciudad: formValue.estado_ciudad, 
        municipio_ciudad: formValue.municipio_ciudad
      };

      this.politicalDivisionService.createCity(createDto).pipe(this.untilDestroyed()).subscribe({
        next: (response) => {
          this.loading = false;
          this.closeModal();
          this.loadCities();
          this.dataChanged.emit();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating city:', error);
        }
      });
    } else {
      const updateDto: CiudadUpdateDto = {
        nom_ciudad: formValue.nom_ciudad,
        estado_ciudad: formValue.estado_ciudad, // ✅ Agregado campo faltante
        municipio_ciudad: formValue.municipio_ciudad
      };

      this.politicalDivisionService.updateCity(this.selectedCityForEdit!.cod_ciudad, updateDto).pipe(this.untilDestroyed()).subscribe({
        next: (response) => {
          this.loading = false;
          this.closeModal();
          this.loadCities();
          this.dataChanged.emit();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating city:', error);
        }
      });
    }
  }

  /**
   * Confirmar eliminación de ciudad
   */
  confirmDelete(city: CiudadDto): void {
    if (confirm(`¿Está seguro de eliminar la ciudad "${city.nom_ciudad}"?`)) {
      this.deleteCity(city);
    }
  }

  /**
   * Eliminar ciudad
   */
  private deleteCity(city: CiudadDto): void {
    this.loading = true;
    
    this.politicalDivisionService.deleteCity(city.cod_ciudad).pipe(this.untilDestroyed()).subscribe({
      next: (response) => {
        this.loading = false;
        this.loadCities();
        this.dataChanged.emit();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error deleting city:', error);
      }
    });
  }

  // ============= GETTERS PARA TEMPLATE =============

  get filteredMunicipalityOptions(): NameSelectOption[] {
    return this.municipalityOptions;
  }

  // ============= UTILIDADES =============

  /**
   * Marcar todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.cityForm.controls).forEach(key => {
      const control = this.cityForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.cityForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtener mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.cityForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength']) return `${fieldName} excede la longitud máxima`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a 0`;
    }
    return '';
  }
}
