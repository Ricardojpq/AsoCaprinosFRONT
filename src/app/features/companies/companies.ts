import { Component, OnInit } from '@angular/core';
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
import { LucideAngularModule, Plus, Search, Pencil, Trash, X, Save } from 'lucide-angular';

import { EmpresaDto, CreateEmpresaDto, UpdateEmpresaDto, EmpresaFilters } from './models/company.dto';
import { CompaniesService } from './Services/companies-service';
import { LaravelPaginationResponse } from '../../shared/models/base-catalog-entity.interface';
import { PoliticalDivisionService } from '../political-division/Services/political-division-service';
import { EstadoDto, MunicipioDto, CiudadDto } from '../political-division/models/political-division.dto';

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
    LucideAngularModule
  ],
  templateUrl: './companies.html',
  styleUrl: './companies.css',
  providers: [MessageService, ConfirmationService]
})
export class Companies implements OnInit {
  // Icons
  plusIcon = Plus;
  searchIcon = Search;
  pencilIcon = Pencil;
  trashIcon = Trash;
  xIcon = X;
  saveIcon = Save;

  // Data
  empresas: EmpresaDto[] = [];
  selectedEmpresas: EmpresaDto[] = [];
  
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
  estados: EstadoDto[] = [];
  municipios: MunicipioDto[] = [];
  ciudades: CiudadDto[] = [];
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
    this.loadEmpresas();
    this.loadEstadosData();
  }

  private initializeForm() {
    this.empresaForm = this.fb.group({
      // Campos requeridos según backend
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
  }

  initializeColumns() {
    this.cols = [
      { field: 'cod_empresa', header: 'Código', sortable: true },
      { field: 'nom_empresa', header: 'Nombre', sortable: true },
      { field: 'rif_empresa', header: 'RIF', sortable: true },
      { field: 'tlf_empresa', header: 'Teléfono', sortable: false },
      { field: 'email', header: 'Email', sortable: true },
      { field: 'estado.nomb_estado', header: 'Estado', sortable: false },
      { field: 'municipio.nomb_municipio', header: 'Municipio', sortable: false },
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
    this.globalFilterValue = event.target.value;
    if (this.globalFilterValue.length >= 3) {
      this.searchEmpresas();
    } else if (this.globalFilterValue.length === 0) {
      this.loadEmpresas();
    }
  }

  searchEmpresas() {
    if (this.globalFilterValue.trim()) {
      const filters: EmpresaFilters = {
        nom_empresa: this.globalFilterValue
      };
      this.loadEmpresas(filters);
    }
  }

  clearSearch() {
    this.globalFilterValue = '';
    this.loadEmpresas();
  }

  openNew() {
    this.isEditMode = false;
    this.empresaForm.reset({
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
    this.municipios = [];
    this.ciudades = [];
    
    this.submitted = false;
    this.empresaDialog = true;
  }

  editEmpresa(empresa: EmpresaDto) {
    this.isEditMode = true;
    this.currentEmpresaId = empresa.cod_empresa; // Store the ID for update
    this.empresaForm.patchValue({
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

  deleteSelectedEmpresas() {
    if (this.selectedEmpresas && this.selectedEmpresas.length > 0) {
      this.confirmationService.confirm({
        message: `¿Está seguro de eliminar ${this.selectedEmpresas.length} empresas seleccionadas?`,
        header: 'Confirmar Eliminación',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          const deletePromises = this.selectedEmpresas.map(empresa =>
            this.empresasService.deleteEmpresa(empresa.cod_empresa).toPromise()
          );

          Promise.all(deletePromises)
            .then(() => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Empresas eliminadas correctamente'
              });
              this.selectedEmpresas = [];
              this.loadEmpresas();
            })
            .catch((error) => {
              console.error('Error deleting empresas:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar empresas'
              });
            });
        }
      });
    }
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

  loadEstadosData() {
    this.loadingEstados = true;
    this.politicalDivisionService.getAllActiveEstados()
      .subscribe({
        next: (estados) => {
          this.estados = estados;
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
  }

  onEstadoChange(codEstado: number) {
    if (codEstado) {
      this.loadMunicipiosByEstado(codEstado);
      // Reset municipio and ciudad when estado changes
      this.empresaForm.patchValue({
        cod_municipio: 0,
        cod_ciudad: 0
      });
      this.municipios = [];
      this.ciudades = [];
    } else {
      this.municipios = [];
      this.ciudades = [];
    }
  }

  loadMunicipiosByEstado(codEstado: number) {
    this.loadingMunicipios = true;
    this.politicalDivisionService.getMunicipiosFullByEstado(codEstado)
      .subscribe({
        next: (municipios) => {
          this.municipios = municipios;
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
  }

  onMunicipioChange(codMunicipio: number) {
    if (codMunicipio) {
      let nomMunicipio = this.municipios.find(m => m.cod_municipio === codMunicipio)?.nom_municipio || '';
      this.loadCiudadesByMunicipio(nomMunicipio);
      // Reset ciudad when municipio changes
      this.empresaForm.patchValue({
        cod_ciudad: 0
      });
      this.ciudades = [];
    } else {
      this.ciudades = [];
    }
  }

  loadCiudadesByMunicipio(nomMunicipio: string) {
    this.loadingCiudades = true;
    this.politicalDivisionService.getCiudadesByMunicipio(nomMunicipio)
      .subscribe({
        next: (ciudades) => {
          this.ciudades = ciudades;
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

  // Load geographic data when editing an existing empresa
  loadGeographicDataForEdit() {
    const codEstado = this.empresaForm.get('cod_estado')?.value;
    const codMunicipio = this.empresaForm.get('cod_municipio')?.value;
    
    if (codEstado) {
      this.loadMunicipiosByEstado(codEstado);
      
      if (codMunicipio) {
        this.loadCiudadesByMunicipio(codMunicipio);
      }
    }
  }
}
