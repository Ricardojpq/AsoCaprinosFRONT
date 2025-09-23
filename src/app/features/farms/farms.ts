import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  filter,
} from 'rxjs/operators';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FarmsService } from './Services/farms-service';
import {
  FincaDto,
  CreateFincaDto,
  UpdateFincaDto,
  FincaQueryParams,
} from './models/finca.dto';
import { LaravelPaginationResponse } from '../../core/models/DTOs/laravel-response';
import { PoliticalDivisionService } from '../political-division/Services/political-division-service';
import { PoliticalDivisionSelectOption } from '../political-division/models/political-division.dto';
import {
  MembersTable,
  SocioSelectionDto,
} from './components/members-table/members-table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import {
  LucideAngularModule,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
} from 'lucide-angular';
import { TextareaModule } from 'primeng/textarea';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-farms',
  templateUrl: './farms.html',
  styleUrl: './farms.css',
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ConfirmDialogModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectModule,
    InputNumberModule,
    TagModule,
    LucideAngularModule,
    TextareaModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    InputGroupModule,
    InputGroupAddonModule,
    DatePickerModule,
    MembersTable,
  ],
})
export class Farms implements OnInit, OnDestroy {
  // Iconos Lucide
  readonly editIcon = Pencil;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly xIcon = X;

  // BehaviorSubject para el término de búsqueda
  private searchSubject$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  // Configuración de búsqueda
  readonly SEARCH_MIN_LENGTH = 3;
  private readonly SEARCH_DEBOUNCE_TIME = 300;

  fincaForm!: FormGroup;
  fincaDialog = false;
  isEditMode = false;
  cols: any[] = [];
  loading = false;
  submitted = false;
  totalRecords = 0;
  page = 1;
  perPage = 10;
  sortField = 'nomb_finca';
  sortOrder: 'asc' | 'desc' = 'asc';
  filters: Partial<FincaQueryParams> = {};
  globalFilterValue = '';
  @ViewChild('dt') dt!: Table;

  // Data properties
  farms: FincaDto[] = [];
  selectedFarms: FincaDto[] = [];
  first = 0;
  rows = 10;
  globalFilter = '';
  finca!: FincaDto;
  selectedFincas: FincaDto[] = [];
  deleteFincaDialog = false;
  submitting = false;
  isEditing = false;

  // Options for dropdowns
  paises: any[] = [];
  estados: any[] = [];
  municipios: any[] = [];
  ciudades: any[] = [];
  estatusOptions: any[] = [];
  tipoGanaderiaOptions = [
    { label: 'Caprino', value: 'c' },
    { label: 'Bovino', value: 'b' },
    { label: 'Mixto', value: 'm' },
  ];
  municipioOptions: any[] = [];
  ciudadOptions: any[] = [];
  tipoSistemaOptions = [
    { label: 'Extensivo', value: 'e' },
    { label: 'Semi-intensivo', value: 's' },
    { label: 'Intensivo', value: 'i' },
    { label: 'Confinamiento', value: 'c' },
  ];
  tipoCriadorOptions: any[] = [];

  // Members table dialog
  showMembersDialog = false;

  constructor(
    private fb: FormBuilder,
    private farmsService: FarmsService,
    private politicalDivisionService: PoliticalDivisionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initializeForm();
  }

  /**
   * Inicializa el formulario reactivo con validaciones
   */
  private initializeForm() {
    this.fincaForm = this.fb.group({
      // Campos obligatorios según tabla real
      cod_empresa: [1, [Validators.required]],
      direccion: ['', [Validators.required, Validators.maxLength(100)]],
      nomb_finca: ['', [Validators.required, Validators.maxLength(50)]],
      fec_inicio: [new Date(), [Validators.required]],
      fec_actualizacion: [new Date(), [Validators.required]],
      imagen: ['', [Validators.required, Validators.maxLength(255)]],
      estatus_finca: ['A', [Validators.required, Validators.maxLength(1)]],

      // Campos opcionales de ubicación
      cod_municipio: [null],
      cod_estado: [null],
      cod_ciudad: [null],
      cod_pais: [null],

      // Campos opcionales de identificación
      ide_finca: ['', [Validators.maxLength(3)]],
      tlf: ['', [Validators.maxLength(12)]],
      rif: ['', [Validators.maxLength(15)]],

      // Campos opcionales de ganadería
      hierro: [null],
      tipo_ganaderia: ['', [Validators.maxLength(1)]],
      tipo_sistema: ['', [Validators.maxLength(1)]],
      banco_semen: ['', [Validators.maxLength(1)]],
      nro_sec_exp: [null],

      // Campos opcionales de exportación/importación
      dir_export: ['', [Validators.maxLength(200)]],
      dir_import: ['', [Validators.maxLength(200)]],
      formato_export: ['', [Validators.maxLength(3)]],

      // Campos opcionales de propietario/contacto
      ced_propietario: ['', [Validators.maxLength(10)]],
      cel_propietrio: ['', [Validators.maxLength(15)]],
      email_propietario: ['', [Validators.email, Validators.maxLength(30)]],
      persona_contacto: ['', [Validators.maxLength(30)]],
      cel_contacto: ['', [Validators.maxLength(15)]],
      email_contacto: ['', [Validators.email, Validators.maxLength(30)]],

      // Campos opcionales adicionales
      previa_sigmav: ['', [Validators.maxLength(10)]],
      tipo_criador: ['', [Validators.maxLength(1)]],
      es_socio: ['', [Validators.maxLength(1)]],
      ide_criador_externo: ['', [Validators.maxLength(10)]],

      // Campos opcionales de fechas
      fec_ult_celo: [null],
      fec_ult_servicio: [null],
      fec_ult_diagnostico: [null],
      fec_ult_parto: [null],
      fec_ult_prog_monta: [null],

      // Campos opcionales de predio
      predio_estado: ['', [Validators.maxLength(2)]],
      predio_municipio: ['', [Validators.maxLength(2)]],
      predio_parroquia: ['', [Validators.maxLength(2)]],

      // Campos opcionales finales
      abr_finca: ['', [Validators.maxLength(15)]],
      id_criador: [null],

      // Campos de propietario
      cod_propietario: [''],
      nombre_propietario: [''],
    });
  }

  ngOnInit() {
    // Inicializar opciones de los selects
    this.estatusOptions = this.farmsService.getEstatusOptions();
    this.tipoCriadorOptions = this.farmsService.getTipoCriadorOptions();

    this.cols = [
      { field: 'ide_finca', header: 'Siglas' },
      { field: 'nomb_finca', header: 'Nombre' },
      { field: 'estado.nom_estado', header: 'Estado' },
      { field: 'municipio.nom_municipio', header: 'Municipio' },
      { field: 'ciudad.nom_ciudad', header: 'Ciudad' },
      { field: 'propietario', header: 'Socio' },
    ];

    // Configurar el pipe de búsqueda
    this.setupSearchPipe();

    // Cargar datos geográficos
    this.loadGeographicData();

    // No llamar loadFarms() aquí - se maneja con lazy loading
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos geográficos iniciales
   */
  private loadGeographicData() {
    // Solo cargar países inicialmente
    this.politicalDivisionService.getAllPaises().subscribe({
      next: (paises: PoliticalDivisionSelectOption[]) => {
        this.paises = paises;
      },
      error: (error: any) => {
        console.error('Error loading países:', error);
      },
    });

    // Inicializar arrays vacíos para los demás dropdowns
    this.estados = [];
    this.municipios = [];
    this.ciudades = [];
  }

  private setupSearchPipe() {
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(this.SEARCH_DEBOUNCE_TIME),
        distinctUntilChanged(),
        filter(
          (searchTerm) =>
            !searchTerm || searchTerm.length >= this.SEARCH_MIN_LENGTH
        )
      )
      .subscribe((searchTerm) => {
        this.filters.search = searchTerm || undefined;
        this.loadFarms();
      });
  }

  /**
   * Limpia la búsqueda y recarga los datos
   */
  clearSearch() {
    this.globalFilterValue = '';
    this.searchSubject$.next('');
    this.filters.search = undefined;
    this.loadFarms();
  }

  loadFarms(event?: any) {
    this.loading = true;
    // Si viene evento de PrimeNG Table (paginación, sort, filtro)
    if (event) {
      this.page = Math.floor(event.first / event.rows) + 1;
      this.perPage = event.rows;
      if (event.sortField) {
        this.sortField = event.sortField;
        this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
      }
    }

    const query: FincaQueryParams = {
      page: this.page,
      per_page: this.perPage,
      sort_by: this.sortField,
      sort_dir: this.sortOrder,
      ...this.filters,
    };

    this.farmsService.getFincas$(query).subscribe({
      next: (res) => {
        this.farms = res.data || [];
        this.totalRecords = res.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading farms:', error);
        this.farms = [];
        this.totalRecords = 0;
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las fincas',
          life: 3000,
        });
      },
    });
  }

  onTableLazyLoad(event: any) {
    this.loadFarms(event);
  }

  onGlobalFilter(event: any) {
    const searchTerm = event.target.value;
    this.globalFilterValue = searchTerm;
    this.searchSubject$.next(searchTerm);
  }

  openNew() {
    this.fincaForm.reset({
      cod_empresa: 1,
      ide_finca: '',
      nomb_finca: '',
      direccion: '',
      cod_pais: null,
      cod_estado: null,
      cod_municipio: null,
      cod_ciudad: null,
      tlf: '',
      rif: '',
      ced_propietario: '',
      cel_propietrio: '',
      email_propietario: '',
      fec_inicio: new Date().toISOString().split('T')[0],
      fec_actualizacion: '',
      hierro: '',
      tipo_ganaderia: '',
      tipo_sistema: '',
      banco_semen: '',
      nro_sec_exp: '',
      dir_export: '',
      dir_import: '',
      formato_export: '',
      persona_contacto: '',
      cel_contacto: '',
      email_contacto: '',
      previa_sigmav: '',
      tipo_criador: '',
      es_socio: false,
      ide_criador_externo: '',
      predio_estado: '',
      predio_municipio: '',
      predio_parroquia: '',
      abr_finca: '',
      id_criador: '',
      imagen: '',
      estatus_finca: 'A',
    });
    this.isEditMode = false;
    this.fincaDialog = true;
    this.submitted = false;
  }

  editFinca(farm: FincaDto) {
    this.selectedFincas = [{ ...farm }];
    this.isEditMode = true;
    this.fincaForm.patchValue({
      cod_empresa: farm.cod_empresa,
      ide_finca: farm.ide_finca,
      nomb_finca: farm.nomb_finca,
      direccion: farm.direccion,
      cod_pais: farm.cod_pais,
      cod_estado: farm.cod_estado,
      cod_municipio: farm.cod_municipio,
      cod_ciudad: farm.cod_ciudad,
      tlf: farm.tlf,
      rif: farm.rif,
      ced_propietario: farm.ced_propietario,
      cel_propietrio: farm.cel_propietrio,
      email_propietario: farm.email_propietario,
      fec_inicio: farm.fec_inicio?.split('T')[0],
      fec_actualizacion: farm.fec_actualizacion?.split('T')[0],
      hierro: farm.hierro,
      tipo_ganaderia: farm.tipo_ganaderia,
      tipo_sistema: farm.tipo_sistema,
      banco_semen: farm.banco_semen,
      nro_sec_exp: farm.nro_sec_exp,
      dir_export: farm.dir_export,
      dir_import: farm.dir_import,
      formato_export: farm.formato_export,
      persona_contacto: farm.persona_contacto,
      cel_contacto: farm.cel_contacto,
      email_contacto: farm.email_contacto,
      previa_sigmav: farm.previa_sigmav,
      tipo_criador: farm.tipo_criador,
      es_socio: farm.es_socio,
      ide_criador_externo: farm.ide_criador_externo,
      predio_estado: farm.predio_estado,
      predio_municipio: farm.predio_municipio,
      predio_parroquia: farm.predio_parroquia,
      abr_finca: farm.abr_finca,
      id_criador: farm.id_criador,
      imagen: farm.imagen,
      estatus_finca: farm.estatus_finca,
    });

    // Cargar datos geográficos para edición
    if (farm.cod_pais) {
      this.onPaisChange({ value: farm.cod_pais });
      setTimeout(() => {
        if (farm.cod_estado) {
          this.onEstadoChange({ value: farm.cod_estado });
          setTimeout(() => {
            if (farm.cod_municipio) {
              this.onMunicipioChange({ value: farm.cod_municipio });
            }
          }, 100);
        }
      }, 100);
    }

    this.isEditMode = true;
    this.fincaDialog = true;
    this.submitted = false;
  }

  deleteFinca(farm: FincaDto) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar la finca ${farm.nomb_finca}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.farmsService.deleteFinca$(farm.cod_finca).subscribe({
          next: () => {
            this.loadFarms();
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Finca eliminada',
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error deleting farm:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la finca',
              life: 3000,
            });
          },
        });
      },
    });
  }

  /**
   * Confirma la eliminación de la finca
   */
  confirmDelete() {
    if (this.finca) {
      this.submitting = true;
      this.farmsService.deleteFinca$(this.finca.cod_finca).subscribe({
        next: () => {
          this.deleteFincaDialog = false;
          this.submitting = false;
          this.loadFarms();
          this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Finca eliminada correctamente',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error deleting farm:', error);
          this.submitting = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar la finca',
            life: 3000,
          });
        },
      });
    }
  }

  hideDialog() {
    this.fincaDialog = false;
    this.fincaForm.reset();
    this.isEditMode = false;
    this.submitted = false;
  }

  /**
   * Valida si un campo específico del formulario es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.fincaForm.get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.submitted)
    );
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.fincaForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} excede la longitud máxima`;
      }
      if (field.errors['email']) {
        return `${fieldName} debe ser un email válido`;
      }
    }
    return '';
  }

  /**
   * Marca todos los campos del formulario como touched para mostrar errores
   */
  private markFormGroupTouched() {
    Object.keys(this.fincaForm.controls).forEach((key) => {
      const control = this.fincaForm.get(key);
      control?.markAsTouched();
    });
  }

  saveFinca() {
    this.submitted = true;

    // Validar formulario
    if (this.fincaForm.invalid) {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Completa todos los campos obligatorios marcados con *',
        life: 3000,
      });
      return;
    }

    this.loading = true;
    const formValue = this.fincaForm.value;

    if (this.isEditMode) {
      // Update
      const updateData: UpdateFincaDto = {
        ...formValue,
      };

      this.farmsService
        .updateFinca$(formValue.cod_finca, updateData)
        .subscribe({
          next: () => {
            this.loadFarms();
            this.fincaDialog = false;
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Actualizado',
              detail: 'Finca actualizada',
              life: 3000,
            });
          },
          error: (error: any) => {
            console.error('Error updating farm:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar la finca',
              life: 5000,
            });
          },
        });
    } else {
      // Create
      const createData: CreateFincaDto = {
        ...formValue,
      };

      this.farmsService.createFinca$(createData).subscribe({
        next: () => {
          this.loadFarms();
          this.fincaDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Finca creada',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error creating farm:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la finca',
            life: 5000,
          });
        },
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'A':
        return 'success';
      case 'I':
        return 'danger';
      case 'S':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'A':
        return 'Activo';
      case 'I':
        return 'Inactivo';
      case 'S':
        return 'Suspendido';
      default:
        return status;
    }
  }

  // Geographic dropdown handlers
  onPaisChange(event: any) {
    const cod_pais = event.value;
    if (cod_pais) {
      // Limpiar estados, municipios y ciudades
      this.estados = [];
      this.municipios = [];
      this.ciudades = [];

      // Limpiar valores del formulario
      this.fincaForm.patchValue({
        cod_estado: null,
        cod_municipio: null,
        cod_ciudad: null,
      });

      // Cargar estados del país seleccionado usando el método correcto
      this.politicalDivisionService.getEstadosByPais(cod_pais).subscribe({
        next: (estados: PoliticalDivisionSelectOption[]) => {
          this.estados = estados;
        },
        error: (error: any) => {
          console.error('Error loading estados:', error);
        },
      });
    }
  }

  onEstadoChange(event: any) {
    const cod_estado = event.value;
    if (cod_estado) {
      // Limpiar municipios y ciudades
      this.municipios = [];
      this.ciudades = [];

      // Limpiar valores del formulario
      this.fincaForm.patchValue({
        cod_municipio: null,
        cod_ciudad: null,
      });

      // Cargar municipios del estado seleccionado
      this.politicalDivisionService
        .getMunicipiosByEstado(cod_estado)
        .subscribe({
          next: (municipios: PoliticalDivisionSelectOption[]) => {
            this.municipios = municipios;
          },
          error: (error: any) => {
            console.error('Error loading municipios:', error);
          },
        });
    }
  }

  onMunicipioChange(event: any) {
    const cod_municipio: Number = event.value;
    if (cod_municipio) {
      // Limpiar ciudades
      this.ciudades = [];

      // Limpiar valores del formulario
      this.fincaForm.patchValue({
        cod_ciudad: null,
      });
      // Obtener el nombre del municipio seleccionado
      const municipioSeleccionado: any = this.municipios.find(
        (m) => m.value === cod_municipio
      );
      const nom_municipio = municipioSeleccionado?.label;

      if (nom_municipio) {
        // Cargar ciudades del municipio seleccionado y filtrar por nom_municipio
        this.politicalDivisionService
          .getCiudadesByMunicipio(nom_municipio)
          .subscribe({
            next: (data: any[]) => {
              this.ciudades = data
                .map((ciudad) => ({
                  label: ciudad.nom_ciudad,
                  value: ciudad.cod_ciudad,
                }));
            },
            error: (error: any) => {
              console.error('Error loading ciudades:', error);
            },
          });
      }
    }
  }

  /**
   * Obtiene la severidad del tag para el tipo de ganadería
   */
  getTipoGanaderiaSeverity(tipo: string): string {
    switch (tipo?.toLowerCase()) {
      case 'caprino':
        return 'success';
      case 'bovino':
        return 'info';
      case 'mixto':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  /**
   * Obtiene la severidad del tag para el estatus de la finca
   */
  getEstatusSeverity(estatus: string): string {
    switch (estatus?.toLowerCase()) {
      case 'activa':
        return 'success';
      case 'inactiva':
        return 'danger';
      case 'en_proceso':
        return 'warning';
      case 'suspendida':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  /**
   * Abre el diálogo para seleccionar propietario (socio)
   */
  openPropietarioSociosDialog() {
    this.showMembersDialog = true;
  }

  /**
   * Maneja la selección de un socio desde el diálogo
   */
  onSocioSelected(socio: SocioSelectionDto) {
    this.fincaForm.patchValue({
      ced_propietario: socio.ced_socio,
      nombre_propietario: `${socio.nom_persona} ${socio.ape_persona}`,
    });
    this.showMembersDialog = false;
  }
}
