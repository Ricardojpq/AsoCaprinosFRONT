import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideAngularModule, Plus, Search, Pencil, Trash2, X, Save } from 'lucide-angular';

import { EmpresaDto, CreateEmpresaDto, UpdateEmpresaDto, EmpresaFilters } from './models/company.dto';
import { CompaniesService } from './Services/companies-service';
import { LaravelPaginationResponse } from '../../shared/models/base-catalog-entity.interface';
import { PoliticalDivisionService } from '../political-division/Services/political-division-service';
import { EstadoDto, MunicipioDto, CiudadDto, PoliticalDivisionSelectOption } from '../political-division/models/political-division.dto';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner';

interface Column {
  field: string;
  header: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-companies',
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
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    LucideAngularModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './companies.html',
  styleUrl: './companies.css',
  providers: [MessageService, ConfirmationService]
})
export class Companies implements OnInit, OnDestroy {
  // Icons
  plusIcon = Plus;
  searchIcon = Search;
  pencilIcon = Pencil;
  trashIcon = Trash2;
  xIcon = X;
  saveIcon = Save;

  // BehaviorSubject para el término de búsqueda
  private searchSubject$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  // Configuración de búsqueda
  readonly SEARCH_MIN_LENGTH = 3;
  private readonly SEARCH_DEBOUNCE_TIME = 300;

  // Data
  empresas: EmpresaDto[] = [];
  
  // Forms
  empresaForm!: FormGroup;
  
  // UI State
  empresaDialog = false;
  loading = false;
  submitted = false;
  isEditMode = false;
  
  // Table configuration
  cols: Column[] = [];
  totalRecords = 0;
  perPage = 25;
  currentPage = 1;
  sortField = 'nom_empresa';
  sortOrder: 'asc' | 'desc' = 'asc';
  globalFilterValue = '';

  // Geographic data
  paises: PoliticalDivisionSelectOption[] = [];
  estados: PoliticalDivisionSelectOption[] = [];
  municipios: PoliticalDivisionSelectOption[] = [];
  ciudades: PoliticalDivisionSelectOption[] = [];
  loadingPaises = false;
  loadingEstados = false;
  loadingMunicipios = false;
  loadingCiudades = false;

  constructor(
    private fb: FormBuilder,
    private empresasService: CompaniesService,
    private politicalDivisionService: PoliticalDivisionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.initializeColumns();
    this.setupSearchPipe();
    this.loadEmpresas();
    // ✅ OPTIMIZACIÓN: No cargar datos geográficos hasta que sea necesario
    // this.loadGeographicData(); // Movido a openNew() y editEmpresa()
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchPipe() {
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(this.SEARCH_DEBOUNCE_TIME),
        distinctUntilChanged(),
        filter(
          (searchTerm) =>
            searchTerm.length === 0 || searchTerm.length >= this.SEARCH_MIN_LENGTH
        )
      )
      .subscribe((searchTerm) => {
        const filters: EmpresaFilters = {};
        if (searchTerm) {
          filters.search = searchTerm;
        }
        this.loadEmpresas(filters);
      });
  }

  private initializeForm() {
    this.empresaForm = this.fb.group({
      // Campos requeridos según backend
      cod_pais: [0, [Validators.required, Validators.min(1)]],
      cod_estado: [0, [Validators.required, Validators.min(1)]],
      cod_municipio: [0, [Validators.required, Validators.min(1)]],
      cod_ciudad: [0, [Validators.required, Validators.min(1)]],
      nom_empresa: ['', [Validators.required, Validators.maxLength(100)]],
      rif_empresa: ['', [Validators.required, Validators.maxLength(20)]],
      
      // Campos opcionales
      tlf_empresa: ['', [Validators.maxLength(20)]],
      fax_empresa: ['', [Validators.maxLength(20)]],
      dir_empresa: ['', [Validators.maxLength(300)]],
      email: ['', [Validators.email, Validators.maxLength(80)]],
      ced_presidente: ['', [Validators.maxLength(20)]],
      is_active: [true]
    });
    
    // Deshabilitar selectores geográficos inicialmente excepto país
    this.empresaForm.get('cod_estado')?.disable();
    this.empresaForm.get('cod_municipio')?.disable();
    this.empresaForm.get('cod_ciudad')?.disable();
  }

  initializeColumns() {
    this.cols = [
      { field: 'cod_empresa', header: 'Código', sortable: true },
      { field: 'nom_empresa', header: 'Nombre', sortable: true },
      { field: 'rif_empresa', header: 'RIF', sortable: true },
      { field: 'tlf_empresa', header: 'Teléfono', sortable: false },
      { field: 'email', header: 'Email', sortable: true },
      { field: 'pais.nom_pais', header: 'País', sortable: false },
      { field: 'estado.nom_estado', header: 'Estado', sortable: false },
      { field: 'municipio.nom_municipio', header: 'Municipio', sortable: false },
      { field: 'presidente.nombre_completo', header: 'Presidente', sortable: false },
      { field: 'is_active', header: 'Activo', sortable: true }
    ];
  }

  loadEmpresas(filters: EmpresaFilters = {}) {
    this.loading = true;
    
    const allFilters = {
      ...filters,
      sort_by: this.sortField,
      sort_dir: this.sortOrder
    };

    this.empresasService.getEmpresas(allFilters, this.currentPage, this.perPage)
      .subscribe({
        next: (response: LaravelPaginationResponse<EmpresaDto>) => {
          this.empresas = response.data;
          this.totalRecords = response.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading empresas:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar empresas'
          });
          this.loading = false;
        }
      });
  }

  onTableLazyLoad(event: any) {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.perPage = event.rows;
    this.sortField = event.sortField || 'nom_empresa';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    
    this.loadEmpresas();
  }

  onGlobalFilter(event: any) {
    const searchTerm = event.target.value;
    this.globalFilterValue = searchTerm;
    this.searchSubject$.next(searchTerm);
  }

  clearSearch() {
    this.globalFilterValue = '';
    this.searchSubject$.next('');
  }

  openNew() {
    this.isEditMode = false;
    this.empresaForm.reset({
      cod_pais: 0,
      cod_estado: 0,
      cod_municipio: 0,
      cod_ciudad: 0,
      nom_empresa: '',
      rif_empresa: '',
      tlf_empresa: '',
      fax_empresa: '',
      dir_empresa: '',
      email: '',
      ced_presidente: '',
      is_active: true
    });
    
    // Clear geographic data
    this.estados = [];
    this.municipios = [];
    this.ciudades = [];
    
    // Deshabilitar selectores geográficos excepto país
    this.empresaForm.get('cod_estado')?.disable();
    this.empresaForm.get('cod_municipio')?.disable();
    this.empresaForm.get('cod_ciudad')?.disable();
    
    // ✅ OPTIMIZACIÓN: Cargar datos geográficos solo cuando se necesiten
    this.loadGeographicData();
    
    this.submitted = false;
    this.empresaDialog = true;
  }

  editEmpresa(empresa: EmpresaDto) {
    this.isEditMode = true;
    this.currentEmpresaId = empresa.cod_empresa; // Store the ID for update
    this.empresaForm.patchValue({
      cod_pais: empresa.cod_pais,
      cod_estado: empresa.cod_estado,
      cod_municipio: empresa.cod_municipio,
      cod_ciudad: empresa.cod_ciudad,
      nom_empresa: empresa.nom_empresa,
      rif_empresa: empresa.rif_empresa,
      tlf_empresa: empresa.tlf_empresa || '',
      fax_empresa: empresa.fax_empresa || '',
      dir_empresa: empresa.dir_empresa || '',
      email: empresa.email || '',
      ced_presidente: empresa.ced_presidente || '',
      is_active: empresa.is_active
    });
    this.loadGeographicDataForEdit();
    this.empresaDialog = true;
  }

  deleteEmpresa(empresa: EmpresaDto) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la empresa ${empresa.nom_empresa}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.empresasService.deleteEmpresa(empresa.cod_empresa)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Empresa eliminada correctamente'
              });
              this.loadEmpresas();
            },
            error: (error) => {
              console.error('Error deleting empresa:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar empresa'
              });
            }
          });
      }
    });
  }


  hideDialog() {
    this.empresaDialog = false;
    this.submitted = false;
  }

  saveEmpresa() {
    this.submitted = true;

    if (this.empresaForm.valid) {
      const formValue = this.empresaForm.value;
      
      if (this.isEditMode) {
        // Update
        const updateData: UpdateEmpresaDto = {
          cod_pais: formValue.cod_pais,
          cod_estado: formValue.cod_estado,
          cod_municipio: formValue.cod_municipio,
          cod_ciudad: formValue.cod_ciudad,
          nom_empresa: formValue.nom_empresa,
          rif_empresa: formValue.rif_empresa,
          tlf_empresa: formValue.tlf_empresa,
          fax_empresa: formValue.fax_empresa,
          dir_empresa: formValue.dir_empresa,
          email: formValue.email,
          ced_presidente: formValue.ced_presidente,
          is_active: formValue.is_active
        };

        // Get empresa ID from current data (assuming we store it during edit)
        const empresaId = this.getCurrentEmpresaId();
        this.empresasService.updateEmpresa(empresaId, updateData)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Empresa actualizada correctamente'
              });
              this.loadEmpresas();
              this.hideDialog();
            },
            error: (error) => {
              console.error('Error updating empresa:', error);
              this.handleFormErrors(error);
            }
          });
      } else {
        // Create
        const createData: CreateEmpresaDto = {
          cod_pais: formValue.cod_pais,
          cod_estado: formValue.cod_estado,
          cod_municipio: formValue.cod_municipio,
          cod_ciudad: formValue.cod_ciudad,
          nom_empresa: formValue.nom_empresa,
          rif_empresa: formValue.rif_empresa,
          tlf_empresa: formValue.tlf_empresa,
          fax_empresa: formValue.fax_empresa,
          dir_empresa: formValue.dir_empresa,
          email: formValue.email,
          ced_presidente: formValue.ced_presidente,
          is_active: formValue.is_active
        };

        this.empresasService.createEmpresa(createData)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Empresa creada correctamente'
              });
              this.loadEmpresas();
              this.hideDialog();
            },
            error: (error) => {
              console.error('Error creating empresa:', error);
              this.handleFormErrors(error);
            }
          });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private currentEmpresaId: number = 0;

  private getCurrentEmpresaId(): number {
    return this.currentEmpresaId;
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
    Object.keys(this.empresaForm.controls).forEach(key => {
      const control = this.empresaForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para acceso fácil a los controles del formulario
  get f() { return this.empresaForm.controls; }

  // Métodos de validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.empresaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.empresaForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched || this.submitted)) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} debe ser mayor a 0`;
      }
      if (field.errors['email']) {
        return 'El formato del email no es válido';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'cod_pais': 'El país',
      'cod_estado': 'El estado',
      'cod_municipio': 'El municipio',
      'cod_ciudad': 'La ciudad',
      'nom_empresa': 'El nombre de la empresa',
      'rif_empresa': 'El RIF',
      'tlf_empresa': 'El teléfono',
      'fax_empresa': 'El fax',
      'dir_empresa': 'La dirección',
      'email': 'El email',
      'ced_presidente': 'La cédula del presidente'
    };
    return labels[fieldName] || 'El campo';
  }

  getPresidenteNombre(presidente: any): string {
    if (!presidente) return '';
    return `${presidente.nom_persona} ${presidente.ape_persona}`.trim();
  }

  // ==================== GEOGRAPHIC DATA METHODS ====================

  /**
   * Carga los datos geográficos iniciales (países)
   */
  loadGeographicData() {
    this.loadingPaises = true;
    this.politicalDivisionService.getAllPaises()
      .subscribe({
        next: (paises: PoliticalDivisionSelectOption[]) => {
          this.paises = paises;
          this.loadingPaises = false;
        },
        error: (error) => {
          console.error('Error loading países:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar países'
          });
          this.loadingPaises = false;
        }
      });
  }

  /**
   * Maneja el cambio de país
   */
  onPaisChange(codPais: number) {
    if (codPais) {
      // Limpiar y deshabilitar niveles inferiores
      this.estados = [];
      this.municipios = [];
      this.ciudades = [];
      
      this.empresaForm.patchValue({
        cod_estado: 0,
        cod_municipio: 0,
        cod_ciudad: 0
      });
      
      // Deshabilitar selectores inferiores
      this.empresaForm.get('cod_municipio')?.disable();
      this.empresaForm.get('cod_ciudad')?.disable();
      
      // Cargar estados del país seleccionado
      this.loadingEstados = true;
      this.politicalDivisionService.getEstadosByPais(codPais)
        .subscribe({
          next: (estados: PoliticalDivisionSelectOption[]) => {
            this.estados = estados;
            this.empresaForm.get('cod_estado')?.enable();
            this.loadingEstados = false;
          },
          error: (error) => {
            console.error('Error loading estados:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al cargar estados'
            });
            this.loadingEstados = false;
          }
        });
    } else {
      // Si no hay país seleccionado, limpiar todo
      this.estados = [];
      this.municipios = [];
      this.ciudades = [];
      this.empresaForm.get('cod_estado')?.disable();
      this.empresaForm.get('cod_municipio')?.disable();
      this.empresaForm.get('cod_ciudad')?.disable();
    }
  }

  /**
   * Maneja el cambio de estado
   */
  onEstadoChange(codEstado: number) {
    if (codEstado) {
      // Limpiar y deshabilitar niveles inferiores
      this.municipios = [];
      this.ciudades = [];
      
      this.empresaForm.patchValue({
        cod_municipio: 0,
        cod_ciudad: 0
      });
      
      // Deshabilitar selector de ciudad
      this.empresaForm.get('cod_ciudad')?.disable();
      
      // Cargar municipios del estado seleccionado
      this.loadingMunicipios = true;
      this.politicalDivisionService.getMunicipiosByEstado(codEstado)
        .subscribe({
          next: (municipios: PoliticalDivisionSelectOption[]) => {
            this.municipios = municipios;
            this.empresaForm.get('cod_municipio')?.enable();
            this.loadingMunicipios = false;
          },
          error: (error) => {
            console.error('Error loading municipios:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al cargar municipios'
            });
            this.loadingMunicipios = false;
          }
        });
    } else {
      // Si no hay estado seleccionado, limpiar niveles inferiores
      this.municipios = [];
      this.ciudades = [];
      this.empresaForm.get('cod_municipio')?.disable();
      this.empresaForm.get('cod_ciudad')?.disable();
    }
  }

  /**
   * Maneja el cambio de municipio
   */
  onMunicipioChange(codMunicipio: number) {
    if (codMunicipio) {
      // Limpiar ciudades
      this.ciudades = [];
      this.empresaForm.patchValue({ cod_ciudad: 0 });
      
      // Obtener el nombre del municipio seleccionado
      const municipioSeleccionado = this.municipios.find(m => m.value === codMunicipio);
      const nomMunicipio = municipioSeleccionado?.label;
      
      if (nomMunicipio) {
        // Cargar ciudades del municipio seleccionado usando el nombre
        this.loadingCiudades = true;
        this.politicalDivisionService.getCiudadesByMunicipio(nomMunicipio)
          .subscribe({
            next: (data: any[]) => {
              this.ciudades = data.map(ciudad => ({
                label: ciudad.nom_ciudad,
                value: ciudad.cod_ciudad
              }));
              this.empresaForm.get('cod_ciudad')?.enable();
              this.loadingCiudades = false;
            },
            error: (error) => {
              console.error('Error loading ciudades:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar ciudades'
              });
              this.loadingCiudades = false;
            }
          });
      }
    } else {
      // Si no hay municipio seleccionado, limpiar ciudades
      this.ciudades = [];
      this.empresaForm.get('cod_ciudad')?.disable();
    }
  }

  /**
   * Carga datos geográficos para edición - Siguiendo el patrón de farms
   */
  loadGeographicDataForEdit() {
    const formValues = this.empresaForm.value;
    
    // Verificar si los países están cargados
    if (this.paises.length === 0) {
      this.loadingPaises = true;
      this.politicalDivisionService.getAllPaises()
        .subscribe({
          next: (paises: PoliticalDivisionSelectOption[]) => {
            this.paises = paises;
            this.loadingPaises = false;
            this.loadGeographicHierarchyForEdit(formValues);
          },
          error: (error) => {
            console.error('Error loading países:', error);
            this.loadingPaises = false;
          }
        });
    } else {
      this.loadGeographicHierarchyForEdit(formValues);
    }
  }

  /**
   * Carga la jerarquía geográfica completa para edición
   */
  private loadGeographicHierarchyForEdit(formValues: any) {
    if (formValues.cod_pais) {
      this.loadingEstados = true;
      
      this.politicalDivisionService.getEstadosByPais(formValues.cod_pais)
        .subscribe({
          next: (estados: PoliticalDivisionSelectOption[]) => {
            this.estados = estados;
            this.empresaForm.get('cod_estado')?.enable();
            this.loadingEstados = false;
            
            // Si hay estado seleccionado, cargar municipios
            if (formValues.cod_estado) {
              this.loadingMunicipios = true;
              
              this.politicalDivisionService.getMunicipiosByEstado(formValues.cod_estado)
                .subscribe({
                  next: (municipios: PoliticalDivisionSelectOption[]) => {
                    this.municipios = municipios;
                    this.empresaForm.get('cod_municipio')?.enable();
                    this.loadingMunicipios = false;
                    
                    // Si hay municipio seleccionado, cargar ciudades
                    if (formValues.cod_municipio) {
                      const municipioSeleccionado = this.municipios.find(m => m.value === formValues.cod_municipio);
                      const nomMunicipio = municipioSeleccionado?.label;
                      
                      if (nomMunicipio) {
                        this.loadingCiudades = true;
                        
                        this.politicalDivisionService.getCiudadesByMunicipio(nomMunicipio)
                          .subscribe({
                            next: (data: any[]) => {
                              this.ciudades = data.map(ciudad => ({
                                label: ciudad.nom_ciudad,
                                value: ciudad.cod_ciudad
                              }));
                              this.empresaForm.get('cod_ciudad')?.enable();
                              this.loadingCiudades = false;
                            },
                            error: (error) => {
                              console.error('Error loading ciudades for edit:', error);
                              this.loadingCiudades = false;
                            }
                          });
                      }
                    }
                  },
                  error: (error) => {
                    console.error('Error loading municipios for edit:', error);
                    this.loadingMunicipios = false;
                  }
                });
            }
          },
          error: (error) => {
            console.error('Error loading estados for edit:', error);
            this.loadingEstados = false;
          }
        });
    }
  }


  /**
   * Getter para determinar si el botón guardar debe estar deshabilitado
   */
  get isSaveButtonDisabled(): boolean {
    return this.empresaForm.invalid || this.submitted;
  }
}
