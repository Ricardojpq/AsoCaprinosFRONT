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
  FormsModule,
} from '@angular/forms';
import { FarmsService } from './Services/farms-service';
import {
  FincaDto,
  CreateFincaDto,
  UpdateFincaDto,
  FincaQueryParams,
  PropietarioFincaDto,
} from './models/finca.dto';
import { PoliticalDivisionService } from '../political-division/Services/political-division-service';
import { PoliticalDivisionSelectOption } from '../political-division/models/political-division.dto';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner';
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
  User,
  Star,
} from 'lucide-angular';
import { TextareaModule } from 'primeng/textarea';
import { FarmLivestockTypeEnum } from '../../core/enums/farm-livestock-type';
import { FarmSystemTypeEnum } from '../../core/enums/farm-system-type.enum';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MembersTable, SocioSelectionDto } from './components/members-table/members-table';

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
    FormsModule,
    LoadingSpinnerComponent
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
  readonly userIcon = User;
  readonly starIcon = Star;

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

  // Loading states for geographic selectors
  loadingPaises = false;
  loadingEstados = false;
  loadingMunicipios = false;
  loadingCiudades = false;
  tipoGanaderiaOptions = [
    { label: 'Carne y Leche', value: FarmLivestockTypeEnum.MEAT_DAIRY },
    { label: 'Leche', value: FarmLivestockTypeEnum.DAIRY },
    { label: 'Cría y Carne', value: FarmLivestockTypeEnum.BREEDING_MEAT },
    { label: 'Carne', value: FarmLivestockTypeEnum.MEAT },
    { label: 'Cría', value: FarmLivestockTypeEnum.BREEDING },
  ];
  municipioOptions: any[] = [];
  ciudadOptions: any[] = [];
  tipoSistemaOptions = [
    { label: 'Intensivo', value: FarmSystemTypeEnum.Intensive },
    { label: 'Semi-Intensivo', value: FarmSystemTypeEnum.SemiIntensive },
    { label: 'Estabulado', value: FarmSystemTypeEnum.CONFINED },
  ];
  tipoCriadorOptions: any[] = [];

  // Members table dialog
  showMembersDialog = false;
  
  // Propietarios seleccionados
  selectedPropietarios: PropietarioFincaDto[] = [];
  propietariosMap: Map<string, string> = new Map(); // Mapa ced_propietario -> nombre completo

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
      // Campos obligatorios
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
    this.loadingPaises = true;
    this.politicalDivisionService.getAllPaises().subscribe({
      next: (paises: PoliticalDivisionSelectOption[]) => {
        this.paises = paises;
        this.loadingPaises = false;
      },
      error: (error: any) => {
        console.error('Error loading países:', error);
        this.loadingPaises = false;
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

    this.farmsService.getFarms$(query).subscribe({
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

    // Set initial disabled state for geographic selectors
    this.fincaForm.get('cod_estado')?.disable();
    this.fincaForm.get('cod_municipio')?.disable();
    this.fincaForm.get('cod_ciudad')?.disable();

    this.selectedPropietarios = [];
    this.propietariosMap.clear();

    this.loadGeographicData();

    this.isEditMode = false;
    this.fincaDialog = true;
    this.submitted = false;
  }

  editFinca(farm: FincaDto) {
    this.selectedFincas = [{ ...farm }];
    this.isEditMode = true;
    
    // IMPORTANTE: Limpiar propietarios ANTES de cargar los nuevos
    this.selectedPropietarios = [];
    this.propietariosMap.clear();
    
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

    this.loadGeographicDataForEditFinca(farm);

    if (farm.propietarios && farm.propietarios.length > 0) {
      this.selectedPropietarios = farm.propietarios.map(persona => ({
        ced_propietario: persona.ced_persona,
        propietario_principal: false, // Se actualizará desde la tabla pivote
        nombre_completo: `${persona.nom_persona} ${persona.ape_persona}`
      }));

      farm.propietarios.forEach(persona => {
        this.propietariosMap.set(
          persona.ced_persona,
          `${persona.nom_persona} ${persona.ape_persona}`
        );
      });

      // TODO: Obtener cuál es el principal desde la tabla pivote
      if (this.selectedPropietarios.length > 0) {
        this.selectedPropietarios[0].propietario_principal = true;
      }
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
            const errorMessage = error?.error?.message || error?.message || 'Error al eliminar la finca';
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage,
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
          const errorMessage = error?.error?.message || error?.message || 'Error al eliminar la finca';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
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
    
    // Limpiar propietarios seleccionados
    this.selectedPropietarios = [];
    this.propietariosMap.clear();
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

    // Validar que haya al menos un propietario
    if (!this.selectedPropietarios || this.selectedPropietarios.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar al menos un propietario',
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
        propietarios: this.selectedPropietarios.map(p => ({
          ced_propietario: p.ced_propietario,
          propietario_principal: p.propietario_principal
        }))
      };

      // Obtener el cod_finca de la finca que se está editando
      const codFinca = this.selectedFincas[0]?.cod_finca;
      
      if (!codFinca) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo identificar la finca a actualizar',
          life: 3000,
        });
        this.loading = false;
        return;
      }

      this.farmsService
        .updateFinca$(codFinca, updateData)
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
              detail: error.error?.message || 'Error al actualizar la finca',
              life: 5000,
            });
          },
        });
    } else {
      // Create
      const createData: CreateFincaDto = {
        ...formValue,
        propietarios: this.selectedPropietarios.map(p => ({
          ced_propietario: p.ced_propietario,
          propietario_principal: p.propietario_principal
        }))
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
            detail: error.error?.message || 'Error al crear la finca',
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

      // Habilitar estado y deshabilitar municipio/ciudad
      this.fincaForm.get('cod_estado')?.enable();
      this.fincaForm.get('cod_municipio')?.disable();
      this.fincaForm.get('cod_ciudad')?.disable();

      // Cargar estados del país seleccionado usando el método correcto
      this.loadingEstados = true;
      this.politicalDivisionService.getEstadosByPais(cod_pais).subscribe({
        next: (estados: PoliticalDivisionSelectOption[]) => {
          this.estados = estados;
          this.loadingEstados = false;
        },
        error: (error: any) => {
          console.error('Error loading estados:', error);
          this.loadingEstados = false;
        },
      });
    } else {
      this.estados = [];
      this.municipios = [];
      this.ciudades = [];
      // Deshabilitar todos los selectores dependientes
      this.fincaForm.get('cod_estado')?.disable();
      this.fincaForm.get('cod_municipio')?.disable();
      this.fincaForm.get('cod_ciudad')?.disable();
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

      // Habilitar municipio y deshabilitar ciudad
      this.fincaForm.get('cod_municipio')?.enable();
      this.fincaForm.get('cod_ciudad')?.disable();

      // Cargar municipios del estado seleccionado
      this.loadingMunicipios = true;
      this.politicalDivisionService
        .getMunicipiosByEstado(cod_estado)
        .subscribe({
          next: (municipios: PoliticalDivisionSelectOption[]) => {
            this.municipios = municipios;
            this.loadingMunicipios = false;
          },
          error: (error: any) => {
            console.error('Error loading municipios:', error);
            this.loadingMunicipios = false;
          },
        });
    } else {
      this.municipios = [];
      this.ciudades = [];
      this.fincaForm.get('cod_municipio')?.disable();
      this.fincaForm.get('cod_ciudad')?.disable();
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

      // Habilitar ciudad
      this.fincaForm.get('cod_ciudad')?.enable();

      // Obtener el nombre del municipio seleccionado
      const municipioSeleccionado: any = this.municipios.find(
        (m) => m.value === cod_municipio
      );
      const nom_municipio = municipioSeleccionado?.label;

      if (nom_municipio) {
        // Cargar ciudades del municipio seleccionado y filtrar por nom_municipio
        this.loadingCiudades = true;
        this.politicalDivisionService
          .getCiudadesByMunicipio(nom_municipio)
          .subscribe({
            next: (data: any[]) => {
              this.ciudades = data
                .map((ciudad) => ({
                  label: ciudad.nom_ciudad,
                  value: ciudad.cod_ciudad,
                }));
              this.loadingCiudades = false;
            },
            error: (error: any) => {
              console.error('Error loading ciudades:', error);
              this.loadingCiudades = false;
            },
          });
      }
    } else {
      this.ciudades = [];
      this.fincaForm.get('cod_ciudad')?.disable();
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
   * Maneja la selección de un socio desde el diálogo (DEPRECATED - usar onOwnersConfirmed)
   */
  onSocioSelected(socio: SocioSelectionDto) {
    this.fincaForm.patchValue({
      ced_propietario: socio.ced_socio,
      nombre_propietario: `${socio.nom_persona} ${socio.ape_persona}`,
    });
    this.showMembersDialog = false;
  }

  /**
   * Maneja la confirmación de propietarios seleccionados
   */
  onOwnersConfirmed(propietarios: PropietarioFincaDto[]) {
    this.selectedPropietarios = propietarios;
    
    // Guardar nombres en el mapa para mostrarlos en la UI
    this.propietariosMap.clear();
    propietarios.forEach(prop => {
      if (prop.nombre_completo) {
        this.propietariosMap.set(prop.ced_propietario, prop.nombre_completo);
      }
    });
    
    // Actualizar el formulario con el propietario principal
    const principal = propietarios.find(p => p.propietario_principal);
    if (principal) {
      this.fincaForm.patchValue({
        ced_propietario: principal.ced_propietario
      });
    }
    
    // El modal se cierra automáticamente en members-table
  }

  /**
   * Obtiene el nombre completo de un propietario por su cédula
   */
  getPropietarioNombre(cedula: string): string {
    return this.propietariosMap.get(cedula) || cedula;
  }

  /**
   * Obtiene el nombre del propietario principal de una finca
   */
  getPropietarioPrincipal(finca: FincaDto): string {
    if (!finca.propietarios || finca.propietarios.length === 0) {
      return 'Sin propietario';
    }

    // TODO: Cuando el backend devuelva el campo propietario_principal en la tabla pivote,
    // buscar el que tenga propietario_principal = true
    // Por ahora, mostrar el primero
    const principal = finca.propietarios[0];
    return `${principal.nom_persona} ${principal.ape_persona}`;
  }

  /**
   * Load geographic data when editing an existing finca
   */
  loadGeographicDataForEditFinca(finca: FincaDto) {
    if (finca.cod_pais) {
      // Cargar estados del país
      this.loadingEstados = true;
      this.politicalDivisionService.getEstadosByPais(finca.cod_pais)
        .subscribe({
          next: (estados: PoliticalDivisionSelectOption[]) => {
            this.estados = estados;
            this.loadingEstados = false;
            // Habilitar estado
            this.fincaForm.get('cod_estado')?.enable();
            
            // Si tiene estado, cargar municipios
            if (finca.cod_estado) {
              this.loadingMunicipios = true;
              this.politicalDivisionService.getMunicipiosByEstado(finca.cod_estado)
                .subscribe({
                  next: (municipios: PoliticalDivisionSelectOption[]) => {
                    this.municipios = municipios;
                    this.loadingMunicipios = false;
                    // Habilitar municipio
                    this.fincaForm.get('cod_municipio')?.enable();
                    
                    // Si tiene municipio, cargar ciudades
                    if (finca.cod_municipio) {
                      const municipioSeleccionado = this.municipios.find(m => m.value === finca.cod_municipio);
                      const nomMunicipio = municipioSeleccionado?.label || '';
                      
                      if (nomMunicipio) {
                        this.loadingCiudades = true;
                        this.politicalDivisionService.getCiudadesByMunicipio(nomMunicipio)
                          .subscribe({
                            next: (data: any[]) => {
                              this.ciudades = data.map((ciudad) => ({
                                label: ciudad.nom_ciudad,
                                value: ciudad.cod_ciudad,
                              }));
                              this.loadingCiudades = false;
                              // Habilitar ciudad
                              this.fincaForm.get('cod_ciudad')?.enable();
                            },
                            error: (error) => {
                              console.error('Error loading ciudades for edit finca:', error);
                              this.loadingCiudades = false;
                            }
                          });
                      }
                    }
                  },
                  error: (error) => {
                    console.error('Error loading municipios for edit finca:', error);
                    this.loadingMunicipios = false;
                  }
                });
            }
          },
          error: (error) => {
            console.error('Error loading estados for edit finca:', error);
            this.loadingEstados = false;
          }
        });
    }
  }
}
