import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom, BehaviorSubject, Subject, takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { AnimalDto } from './models/DTOs/animal';
import { AnimalCreateDto } from './models/DTOs/animal-create';
import { AnimalUpdateDto } from './models/DTOs/animal-update';
import { AnimalsService, AnimalQueryParams } from './services/animals-service';
import { CatalogsService } from './catalogs/services/catalogs-service';

// Interfaz temporal para CatalogSelectOption
interface CatalogSelectOption {
  label: string;
  value: any;
}

import {
  ANIMAL_SEARCH_CONFIG,
  isValidSearchTerm,
} from './config/search-config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FarmsTableComponent } from './components/farms-table/farms-table.component';
import { FincaDto } from '../farms/models/finca.dto';
import { SelectModule } from 'primeng/select';
import {
  LucideAngularModule,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
} from 'lucide-angular';
import { TextareaModule } from 'primeng/textarea';
import { DatePipe } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { AnimalSelectionTable } from './components/animal-selection-table/animal-selection-table';

@Component({
  selector: 'app-animals',
  templateUrl: './animals.html',
  styleUrl: './animals.css',
  providers: [MessageService, ConfirmationService, DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FileUploadModule,
    DialogModule,
    ConfirmDialogModule,
    TableModule,
    TagModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectModule,
    LucideAngularModule,
    TextareaModule,
    DatePipe,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    FarmsTableComponent,
    AnimalSelectionTable
],
})
export class Animals implements OnInit, OnDestroy {
  readonly trashIcon = Trash2;
  readonly pencilIcon = Pencil;
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly xIcon = X;

  // BehaviorSubject para el término de búsqueda
  private searchSubject$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  // Configuración de búsqueda desde el archivo de configuración
  readonly SEARCH_MIN_LENGTH = ANIMAL_SEARCH_CONFIG.minSearchLength;
  private readonly SEARCH_DEBOUNCE_TIME = ANIMAL_SEARCH_CONFIG.debounceTime;

  animals: AnimalDto[] = [];
  animalForm!: FormGroup;
  animalDialog = false;
  isEditMode = false;
  cols: any[] = [];
  loading = false;
  submitted = false;
  totalRecords = 0;
  page = 1;
  perPage = 10;
  sortField = 'nomb_animal';
  sortOrder: 'asc' | 'desc' = 'asc';
  filters: Partial<AnimalQueryParams> = {};
  globalFilterValue = '';
  @ViewChild('dt') dt!: Table;

  // Opciones para los selects - se inicializan en ngOnInit
  sexoOptions: any[] = [];
  statusOptions: any[] = [];
  origenOptions: any[] = [];
  tipoConcepcionOptions: any[] = [];
  tipoPartoOptions: any[] = [];
  materialGeneticoOptions: any[] = [];
  protocoloImportacionOptions: any[] = [];
  compRacialOptions: any[] = [];
  
  // Opciones para catálogos dinámicos
  razaOptions: CatalogSelectOption[] = [];
  colorOptions: CatalogSelectOption[] = [];
  tipoPeloOptions: CatalogSelectOption[] = [];
  
  // Opciones mock para los nuevos campos
  infoOrejasOptions: any[] = [];
  infoCuernosOptions: any[] = [];
  tipoRegistroOptions: any[] = [];
  
  // Animal original para edición
  originalAnimal: AnimalDto | null = null;

  // Farms selection
  showCriadorFarmsDialog = false;
  showPropietarioFarmsDialog = false;
  selectedCriadorFinca: FincaDto | null = null;
  selectedPropietarioFinca: FincaDto | null = null;

  // Genealogy selection
  showPadreSelectionDialog = false;
  showMadreSelectionDialog = false;
  selectedPadre: AnimalDto | null = null;
  selectedMadre: AnimalDto | null = null;

  constructor(
    private fb: FormBuilder,
    private animalsService: AnimalsService,
    private catalogsService: CatalogsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initializeForm();
  }

  /**
   * Inicializa el formulario reactivo con validaciones
   */
  private initializeForm() {
    this.animalForm = this.fb.group({
      // Campos básicos requeridos
      cod_finca: [1, [Validators.required]],
      cod_animal: ['', [Validators.required, Validators.maxLength(15)]],
      nomb_animal: ['', [Validators.required, Validators.maxLength(50)]],
      sexo_animal: ['M', [Validators.required]],
      fec_nacim: ['', [Validators.required]],
      
      // Campos de catálogos
      estatus: ['A'],
      cod_raza: [1, [Validators.required]], // Campo obligatorio
      cod_color: [1],
      cod_tipo_pelo: [1],
      origen: ['N', [Validators.required]],
      
      // Campos de fincas - obligatorios
      cod_finca_actual: [null, [Validators.required]], // Campo obligatorio para propietario
      siglas_criador: [''],
      nombre_criador: [''],
      siglas_propietario: [''],
      nombre_propietario: [''],
      
      // Campos de genealogía - opcionales
      cod_finca_padre: [null],
      cod_padre: [''],
      nombre_padre: [''],
      cri_padre: [''], // criador del padre
      nro_reg_padre: [''], // nro_registro_cla del padre
      cod_aso_padre: [''], // cod_asociacion del padre
      padre_aso: [''], // old_aso del padre
      pru_aso_padre: [''], // pru_aso del padre
      
      cod_finca_madre: [null],
      cod_madre: [''],
      nombre_madre: [''],
      cri_madre: [''], // criador de la madre
      nro_reg_madre: [''], // nro_registro_cla de la madre
      cod_aso_madre: [''], // cod_asociacion de la madre
      madre_aso: [''], // old_aso de la madre
      pru_aso_madre: [''], // pru_aso de la madre
      
      // Campos de peso
      peso_actual: [0, [Validators.min(0)]],
      peso_al_nacer: [0, [Validators.min(0)]],
      peso_al_destete: [0, [Validators.min(0)]],
      fec_destete: [''],
      
      // Campos de tatuaje
      tatuaje: [''],
      tatuaje_oreja_izq: [''],
      tatuaje_oreja_der: [''],
      tatuaje_cola: [''],
      
      // Campos de tipo y origen
      tipo_concepcion: ['M'],
      tipo_parto: ['S'],
      material_genetico: ['A'],
      protocolo_importacion: ['S'],
      
      // Campos de composición racial
      codigo_aso: [''],
      p_sangre: [''],
      porcen_sangre: [{value: 0, disabled: true}, [Validators.min(0), Validators.max(100)]],
      
      // Campos adicionales
      observac: [''],
      imagen: [''],
      precio_con_igv: [0, [Validators.min(0)]],
      stock_minimo: [0, [Validators.min(0)]],
      
      // Nuevos campos añadidos
      info_orejas: ['', [Validators.maxLength(200)]],
      info_cuernos: ['', [Validators.maxLength(200)]],
      tipo_registro: ['', [Validators.maxLength(200)]],
      aretes: ['', [Validators.maxLength(200)]],
      reg_intl: ['', [Validators.maxLength(200)]]
    });
  }

  /**
   * Inicializa las opciones mock para los nuevos campos select
   */
  private initializeMockOptions() {
    // Opciones para Información de Orejas
    this.infoOrejasOptions = [
      { label: 'Orejas Normales', value: 'normales' },
      { label: 'Orejas Grandes', value: 'grandes' },
      { label: 'Orejas Pequeñas', value: 'pequenas' },
      { label: 'Orejas Caídas', value: 'caidas' },
      { label: 'Orejas Erguidas', value: 'erguidas' },
      { label: 'Orejas Asimétricas', value: 'asimetricas' }
    ];

    // Opciones para Información de Cuernos
    this.infoCuernosOptions = [
      { label: 'Sin Cuernos (Mocho)', value: 'sin_cuernos' },
      { label: 'Cuernos Pequeños', value: 'pequenos' },
      { label: 'Cuernos Medianos', value: 'medianos' },
      { label: 'Cuernos Grandes', value: 'grandes' },
      { label: 'Cuernos Curvos', value: 'curvos' },
      { label: 'Cuernos Rectos', value: 'rectos' },
      { label: 'Cuernos Asimétricos', value: 'asimetricos' }
    ];

    // Opciones para Tipo de Registro
    this.tipoRegistroOptions = [
      { label: 'Registro Nacional', value: 'nacional' },
      { label: 'Registro Internacional', value: 'internacional' },
      { label: 'Registro Provisional', value: 'provisional' },
      { label: 'Registro Definitivo', value: 'definitivo' },
      { label: 'Registro de Importación', value: 'importacion' },
      { label: 'Registro de Exportación', value: 'exportacion' },
      { label: 'Sin Registro', value: 'sin_registro' }
    ];
  }

  ngOnInit() {
    // Inicializar opciones de los selects usando enums (sin llamadas HTTP)
    this.sexoOptions = this.animalsService.getSexoOptions();
    this.statusOptions = this.animalsService.getEstatusOptions();
    this.origenOptions = this.animalsService.getOrigenOptions();
    this.tipoConcepcionOptions = this.animalsService.getTipoConcepcionOptions();
    this.tipoPartoOptions = this.animalsService.getTipoPartoOptions();
    this.materialGeneticoOptions = this.animalsService.getMaterialGeneticoOptions();
    this.protocoloImportacionOptions = this.animalsService.getProtocoloImportacionOptions();
    this.compRacialOptions = this.animalsService.getCompRacialOptions();
    
    // Inicializar opciones mock para los nuevos campos
    this.initializeMockOptions();

    this.cols = [
      { field: 'cod_finca', header: 'Id Finca' },
      { field: 'nomb_animal', header: 'Nombre' },
      { field: 'fec_nacim', header: 'Fec Nac' },
      { field: 'sexo_animal', header: 'Sexo' },
      { field: 'imagen', header: 'Imagen' },
      { field: 'raza.nomb_raza', header: 'Raza' },
      { field: 'estatus', header: 'Estatus' },
      { field: 'origen', header: 'Origen' },
      { field: 'tipo_concepcion', header: 'Tipo Concepción' },
      { field: 'tipo_parto', header: 'Tipo Parto' },
      { field: 'p_sangre', header: 'C. Racial' },
      { field: 'porcen_sangre', header: '% Racial' },
      { field: 'criador.nomb_finca', header: 'Criador' },
      { field: 'propietario.nomb_finca', header: 'Propietario' },
    ];
    this.sortField = 'nomb_animal'; // Cambiar de 'cod_animal' a 'nomb_animal'

    // Configurar el pipe de búsqueda
    this.setupSearchPipe();
    
    // ✅ OPTIMIZACIÓN: No cargar catálogos hasta que sea necesario
    // this.loadCatalogs(); // Movido a cuando se abra el modal de crear/editar
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los catálogos dinámicos desde el servicio
   */
  private loadCatalogs() {
    // Cargar razas
    this.catalogsService.getAllRazas$().subscribe({
      next: (razas) => {
        this.razaOptions = razas.map(raza => ({
          label: raza.descripcion,
          value: raza.cod_raza
        }));
      },
      error: (error) => {
        console.error('Error loading razas:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar las razas',
          life: 3000,
        });
      }
    });

    // Cargar colores
    this.catalogsService.getAllColors$().subscribe({
      next: (colores) => {
        this.colorOptions = colores.map(color => ({
          label: color.nomb_color,
          value: color.cod_color
        }));
      },
      error: (error) => {
        console.error('Error loading colores:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los colores',
          life: 3000,
        });
      }
    });

    // Cargar tipos de pelo
    this.catalogsService.getAllTiposPelo$().subscribe({
      next: (tiposPelo: any[]) => {
        this.tipoPeloOptions = tiposPelo.map((tipoPelo: any) => ({
          label: tipoPelo.nomb_tipo_pelo,
          value: tipoPelo.cod_tipo_pelo
        }));
      },
      error: (error: any) => {
        console.error('Error loading tipos de pelo:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los tipos de pelo',
          life: 3000,
        });
      }
    });
  }

  /**
   * Configura el pipe de búsqueda con debounce y filtro de longitud mínima
   */
  private setupSearchPipe() {
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(this.SEARCH_DEBOUNCE_TIME),
        distinctUntilChanged(),
        filter((searchTerm) => isValidSearchTerm(searchTerm))
      )
      .subscribe((searchTerm) => {
        this.filters.search = searchTerm || undefined;
        this.loadAnimals();
      });
  }

  /**
   * Limpia la búsqueda y recarga los datos
   */
  clearSearch() {
    this.globalFilterValue = '';
    this.searchSubject$.next('');
    this.filters.search = undefined;
    this.loadAnimals();
  }

  loadAnimals(event?: any) {
    this.loading = true;
    // Si viene evento de PrimeNG Table (paginación, sort, filtro)
    if (event) {
      this.page = Math.floor(event.first / event.rows) + 1;
      this.perPage = event.rows;
      if (event.sortField) {
        this.sortField = event.sortField;
        this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
      }
      // Filtros globales
      if (event.filters) {
        this.filters = {};
        Object.keys(event.filters).forEach((key) => {
          const val = event.filters[key]?.value;
          if (val) this.filters[key] = val;
        });
      }
    }
    const query: AnimalQueryParams = {
      page: this.page,
      per_page: this.perPage,
      sort_by: this.sortField,
      sort_dir: this.sortOrder,
      ...this.filters,
    };
    this.animalsService.getAnimals$(query).subscribe({
      next: (res) => {
        this.animals = res.data || [];
        this.totalRecords = res.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading animals:', error);
        this.animals = [];
        this.totalRecords = 0;
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los animales',
          life: 3000,
        });
      },
    });
  }

  onTableLazyLoad(event: any) {
    this.loadAnimals(event);
  }

  onGlobalFilter(event: any) {
    const searchTerm = event.target.value;
    this.globalFilterValue = searchTerm;
    this.searchSubject$.next(searchTerm);
  }

  openNew() {
    this.animalForm.reset({
      cod_finca: null, // Se llenará al seleccionar criador
      cod_animal: '',
      nomb_animal: '',
      sexo_animal: 'M',
      estatus: 'A',
      fec_nacim: new Date().toISOString().split('T')[0],
      cod_raza: 1,
      cod_color: 1,
      cod_tipo_pelo: 1,
      origen: 'N',
      tipo_concepcion: 'M',
      tipo_parto: 'S',
      material_genetico: 'A',
      protocolo_importacion: 'S',
      peso_al_nacer: 0,
      fec_destete: '',
      peso_al_destete: 0,
      codigo_aso: '',
      tatuaje_oreja_izq: '',
      tatuaje_oreja_der: '',
      tatuaje_cola: '',
      p_sangre: '',
      porcen_sangre: 0,
      precio_con_igv: 0,
      stock_minimo: 0,
      imagen: '',
      // Campos de fincas
      cod_finca_actual: null, // Se llenará al seleccionar propietario
      siglas_criador: '',
      nombre_criador: '',
      siglas_propietario: '',
      nombre_propietario: '',
      // Campos de genealogía
      cod_finca_padre: null,
      cod_padre: '',
      nombre_padre: '',
      cri_padre: '',
      nro_reg_padre: '',
      cod_aso_padre: '',
      padre_aso: '',
      pru_aso_padre: '',
      
      cod_finca_madre: null,
      cod_madre: '',
      nombre_madre: '',
      cri_madre: '',
      nro_reg_madre: '',
      cod_aso_madre: '',
      madre_aso: '',
      pru_aso_madre: ''
    });
    
    // Limpiar selecciones de fincas y genealogía
    this.selectedCriadorFinca = null;
    this.selectedPropietarioFinca = null;
    this.selectedPadre = null;
    this.selectedMadre = null;
    this.originalAnimal = null; // Limpiar animal original
    
    // ✅ OPTIMIZACIÓN: Cargar catálogos solo cuando se necesiten
    this.loadCatalogs();
    
    this.isEditMode = false;
    this.animalDialog = true;
    this.submitted = false;
  }

  editAnimal(animal: AnimalDto) {
    // Almacenar el animal original para usar en el update
    this.originalAnimal = animal;
    
    this.animalForm.patchValue({
      cod_finca: animal.cod_finca,
      cod_animal: animal.cod_animal,
      nomb_animal: animal.nomb_animal,
      sexo_animal: animal.sexo_animal,
      estatus: animal.estatus,
      fec_nacim: this.formatDateForInput(animal.fec_nacim),
      cod_raza: animal.cod_raza,
      cod_color: animal.cod_color,
      cod_tipo_pelo: animal.cod_tipo_pelo,
      origen: animal.origen,
      tipo_concepcion: animal.tipo_concepcion,
      tipo_parto: animal.tipo_parto,
      material_genetico: animal.tipo_material_gen,
      protocolo_importacion: animal.protocolo_imp,
      peso_actual: animal.peso_actual,
      peso_al_nacer: animal.peso_al_nacer,
      peso_al_destete: animal.peso_destete,
      fec_destete: this.formatDateForInput(animal.fec_destete),
      tatuaje: animal.tatuaje,
      tatuaje_oreja_izq: animal.tatuaje_oreja_izq,
      tatuaje_oreja_der: animal.tatuaje_oreja_der,
      tatuaje_cola: animal.tatuaje_cola,
      codigo_aso: animal.cod_asociacion,
      p_sangre: animal.p_sangre,
      porcen_sangre: animal.porcen_sangre,
      observac: animal.observac,
      imagen: animal.imagen,
      precio_con_igv: animal.precio_con_igv,
      stock_minimo: animal.stock_minimo,
      
      info_orejas: animal.info_orejas,
      info_cuernos: animal.info_cuernos,
      tipo_registro: animal.tipo_registro,
      aretes: animal.aretes,
      reg_intl: animal.reg_intl,
      // Campos de fincas
      cod_finca_actual: animal.cod_finca_actual,
      siglas_criador: animal.criador?.cod_finca || '',
      nombre_criador: animal.criador?.nomb_finca || '',
      siglas_propietario: animal.propietario?.cod_finca || '',
      nombre_propietario: animal.propietario?.nomb_finca || '',
      // Campos de genealogía
      cod_finca_padre: animal.cod_finca_padre,
      cod_padre: animal.cod_padre || '',
      nombre_padre: '', // Se llenará si hay datos de padre
      cri_padre: animal.cri_padre || '',
      nro_reg_padre: animal.nro_reg_padre || '',
      cod_aso_padre: animal.cod_aso_padre || '',
      padre_aso: animal.padre_aso || '',
      pru_aso_padre: animal.pru_aso_padre || '',
      
      cod_finca_madre: animal.cod_finca_madre,
      cod_madre: animal.cod_madre || '',
      nombre_madre: '', // Se llenará si hay datos de madre
      cri_madre: animal.cri_madre || '',
      nro_reg_madre: animal.nro_reg_madre || '',
      cod_aso_madre: animal.cod_aso_madre || '',
      madre_aso: animal.madre_aso || '',
      pru_aso_madre: animal.pru_aso_madre || ''
    });
    
    // Cargar nombres de padre y madre si existen
    this.loadParentNames(animal);
    
    
    // Nota: No podemos establecer selectedCriadorFinca y selectedPropietarioFinca 
    // porque FincaInfo no es compatible con FincaDto
    // El usuario tendrá que seleccionar las fincas nuevamente si quiere cambiarlas
    this.selectedCriadorFinca = null;
    this.selectedPropietarioFinca = null;
    this.selectedPadre = null;
    this.selectedMadre = null;
    
    // ✅ OPTIMIZACIÓN: Cargar catálogos solo cuando se necesiten
    this.loadCatalogs();
    
    this.isEditMode = true;
    this.animalDialog = true;
    this.submitted = false;
  }

  deleteAnimal(animal: AnimalDto) {
    // Primero verificar si el animal puede ser eliminado
    this.loading = true;
    this.animalsService
      .canDeleteAnimal$(animal.cod_finca.toString(), animal.cod_animal)
      .subscribe({
        next: (canDeleteResult) => {
          this.loading = false;
          
          if (!canDeleteResult.can_delete) {
            // Mostrar mensaje de error si no se puede eliminar
            this.messageService.add({
              severity: 'warn',
              summary: 'No se puede eliminar',
              detail: canDeleteResult.reason || 'El animal no puede ser eliminado',
              life: 5000,
            });
            return;
          }

          // Si se puede eliminar, mostrar confirmación
          this.confirmationService.confirm({
            message: `¿Seguro que deseas eliminar el animal ${animal.nomb_animal}?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
              this.loading = true;
              this.animalsService
                .deleteAnimal$(animal.cod_finca.toString(), animal.cod_animal)
                .subscribe({
                  next: () => {
                    this.loadAnimals();
                    this.loading = false;
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Eliminado',
                      detail: 'Animal eliminado exitosamente',
                      life: 3000,
                    });
                  },
                  error: (error) => {
                    console.error('Error deleting animal:', error);
                    this.loading = false;
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Error',
                      detail: error.message || 'Error al eliminar el animal',
                      life: 5000,
                    });
                  },
                });
            },
          });
        },
        error: (error) => {
          console.error('Error checking if animal can be deleted:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al verificar si el animal puede ser eliminado',
            life: 3000,
          });
        },
      });
  }


  hideDialog() {
    this.animalDialog = false;
    this.animalForm.reset();
    this.isEditMode = false;
    this.submitted = false;
  }

  /**
   * Valida si un campo específico del formulario es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.animalForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.animalForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} excede la longitud máxima`;
      }
      if (field.errors['min']) {
        return `${fieldName} debe ser mayor o igual a ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${fieldName} debe ser menor o igual a ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  /**
   * Marca todos los campos del formulario como touched para mostrar errores
   */
  private markFormGroupTouched() {
    Object.keys(this.animalForm.controls).forEach(key => {
      const control = this.animalForm.get(key);
      control?.markAsTouched();
    });
  }

  saveAnimal() {
    this.submitted = true;

    // Validar formulario
    if (this.animalForm.invalid) {
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
    const formValue = this.animalForm.value;

    if (this.isEditMode) {
      // Update - solo enviar campos que se pueden actualizar
      const updateData: AnimalUpdateDto = {
        nomb_animal: formValue.nomb_animal,
        sexo_animal: formValue.sexo_animal,
        estatus: formValue.estatus,
        cod_raza: formValue.cod_raza,
        peso_actual: formValue.peso_actual,
        peso_al_nacer: formValue.peso_al_nacer,
        fec_nacim: formValue.fec_nacim,
        fec_destete: formValue.fec_destete,
        peso_destete: formValue.peso_al_destete,
        cod_color: formValue.cod_color,
        cod_tipo_pelo: formValue.cod_tipo_pelo,
        origen: formValue.origen,
        tipo_concepcion: formValue.tipo_concepcion,
        tipo_parto: formValue.tipo_parto,
        tipo_material_gen: formValue.material_genetico,
        protocolo_imp: formValue.protocolo_importacion,
        tatuaje: formValue.tatuaje,
        tatuaje_oreja_der: formValue.tatuaje_oreja_der,
        tatuaje_cola: formValue.tatuaje_cola,
        cod_asociacion: formValue.codigo_aso,
        p_sangre: formValue.p_sangre,
        porcen_sangre: formValue.porcen_sangre,
        observac: formValue.observac,
        
        // Campos de finca (solo propietario - criador no se puede modificar)
        cod_finca_actual: formValue.cod_finca_actual, // Finca propietaria actual
        
        // Nuevos campos añadidos
        info_orejas: formValue.info_orejas,
        info_cuernos: formValue.info_cuernos,
        tipo_registro: formValue.tipo_registro,
        aretes: formValue.aretes,
        reg_intl: formValue.reg_intl,
      };

      // Usar los valores originales del animal para la URL, no los del formulario
      const originalCodFinca = this.originalAnimal?.cod_finca?.toString() || formValue.cod_finca.toString();
      const originalCodAnimal = this.originalAnimal?.cod_animal || formValue.cod_animal;
      
      this.animalsService
        .updateAnimal$(
          originalCodFinca,
          originalCodAnimal,
          updateData
        )
        .subscribe({
          next: () => {
            this.loadAnimals();
            this.animalDialog = false;
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Actualizado',
              detail: 'Animal actualizado',
              life: 3000,
            });
          },
          error: (error: any) => {
            console.error('Error updating animal:', error);
            this.loading = false;

            let errorDetail = 'Error al actualizar el animal';
            if (error.details && error.details.detail) {
              errorDetail = error.details.detail;
            } else if (error.message) {
              errorDetail = error.message;
            }
 
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorDetail,
              life: 5000,
            });
          },
        });
    } else {
      // Create - enviar todos los campos requeridos
      const createData: Partial<AnimalCreateDto> = {
        // Campos básicos requeridos
        cod_finca: formValue.cod_finca, // Finca del criador (donde nació el animal)
        cod_animal: formValue.cod_animal,
        nomb_animal: formValue.nomb_animal,
        sexo_animal: formValue.sexo_animal,
        fec_nacim: formValue.fec_nacim,
        fec_ingreso: new Date().toISOString().split('T')[0],
        
        // Finca actual (propietario actual)
        cod_finca_actual: formValue.cod_finca_actual,
        
        // Campos de genealogía (opcionales)
        cod_finca_padre: formValue.cod_finca_padre || undefined,
        cod_padre: formValue.cod_padre || undefined,
        cri_padre: formValue.cri_padre || undefined,
        nro_reg_padre: formValue.nro_reg_padre || undefined,
        cod_aso_padre: formValue.cod_aso_padre || undefined,
        padre_aso: formValue.padre_aso || undefined,
        pru_aso_padre: formValue.pru_aso_padre || undefined,
        
        cod_finca_madre: formValue.cod_finca_madre || undefined,
        cod_madre: formValue.cod_madre || undefined,
        cri_madre: formValue.cri_madre || undefined,
        nro_reg_madre: formValue.nro_reg_madre || undefined,
        cod_aso_madre: formValue.cod_aso_madre || undefined,
        madre_aso: formValue.madre_aso || undefined,
        pru_aso_madre: formValue.pru_aso_madre || undefined,
        
        // Campos de catálogos
        estatus: formValue.estatus || 'A',
        cod_raza: formValue.cod_raza || 0,
        cod_color: formValue.cod_color || 0,
        cod_tipo_pelo: formValue.cod_tipo_pelo || undefined,
        
        // Campos de peso
        peso_actual: formValue.peso_actual || 0,
        peso_al_nacer: formValue.peso_al_nacer || 0,
        peso_destete: formValue.peso_al_destete || undefined,
        fec_destete: formValue.fec_destete || undefined,
        
        // Campos de tatuaje
        tatuaje: formValue.tatuaje || undefined,
        tatuaje_oreja_izq: formValue.tatuaje_oreja_izq || undefined,
        tatuaje_oreja_der: formValue.tatuaje_oreja_der || undefined,
        tatuaje_cola: formValue.tatuaje_cola || undefined,
        
        // Campos de origen y tipo
        origen: formValue.origen || 'N',
        tipo_concepcion: formValue.tipo_concepcion || 'M',
        tipo_parto: formValue.tipo_parto || 'S',
        
        // Campos de material genético y protocolo
        tipo_material_gen: formValue.material_genetico || undefined,
        protocolo_imp: formValue.protocolo_importacion || undefined,
        
        // Campos de asociación y composición racial
        cod_asociacion: formValue.codigo_aso || undefined,
        p_sangre: formValue.p_sangre || undefined,
        porcen_sangre: formValue.porcen_sangre || undefined,
        
        // Campos adicionales
        observac: formValue.observac || undefined,
        imagen: formValue.imagen || undefined,
        
        // Nuevos campos añadidos
        info_orejas: formValue.info_orejas || undefined,
        info_cuernos: formValue.info_cuernos || undefined,
        tipo_registro: formValue.tipo_registro || undefined,
        aretes: formValue.aretes || undefined,
        reg_intl: formValue.reg_intl || undefined,
      };

      this.animalsService.addAnimal$(createData).subscribe({
        next: () => {
          this.loadAnimals();
          this.animalDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Animal creado',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error creating animal:', error);
          this.loading = false;

          let errorDetail = 'Error al crear el animal';
          if (error.details && error.details.detail) {
            errorDetail = error.details.detail;
          } else if (error.message) {
            errorDetail = error.message;
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorDetail,
            life: 5000,
          });
        },
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVO':
      case 'Activo':
        return 'success';
      case 'Vendido':
        return 'info';
      case 'Enfermo':
        return 'danger';
      case 'Retirado':
      default:
        return 'secondary';
    }
  }

  // Farm selection methods
  openCriadorFarmsDialog() {
    this.showCriadorFarmsDialog = true;
  }

  openPropietarioFarmsDialog() {
    this.showPropietarioFarmsDialog = true;
  }

  onCriadorFincaSelected(finca: FincaDto) {
    this.selectedCriadorFinca = finca;
    this.animalForm.patchValue({
      cod_finca: finca.cod_finca, // Llenar cod_finca con la finca del criador
      siglas_criador: finca.ide_finca,
      nombre_criador: finca.nomb_finca
    });
    this.showCriadorFarmsDialog = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Criador Seleccionado',
      detail: `Finca criadora: ${finca.nomb_finca} (${finca.ide_finca})`,
      life: 3000,
    });
  }

  onPropietarioFincaSelected(finca: FincaDto) {
    this.selectedPropietarioFinca = finca;
    this.animalForm.patchValue({
      cod_finca_actual: finca.cod_finca, // Llenar cod_finca_actual con la finca del propietario
      siglas_propietario: finca.ide_finca,
      nombre_propietario: finca.nomb_finca
    });
    this.showPropietarioFarmsDialog = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Propietario Seleccionado',
      detail: `Finca propietaria: ${finca.nomb_finca} (${finca.ide_finca})`,
      life: 3000,
    });
  }

  // Genealogy selection methods
  openPadreSelectionDialog() {
    this.showPadreSelectionDialog = true;
  }

  openMadreSelectionDialog() {
    this.showMadreSelectionDialog = true;
  }

  onPadreSelected(padre: AnimalDto) {
    this.selectedPadre = padre;
    this.animalForm.patchValue({
      // Mapeo según los requerimientos:
      cod_finca_padre: padre.cod_finca_actual || padre.cod_finca, // cod_finca_padre -> cod_finca_actual del padre
      cod_padre: padre.cod_animal, // cod_padre -> cod_animal del padre
      nombre_padre: padre.nomb_animal,
      cri_padre: padre.cod_criador?.toString() || '', // cri_padre -> cod_criador del padre
      nro_reg_padre: padre.nro_registro_cla || '', // nro_reg_padre -> nro_registro_cla del padre
      cod_aso_padre: padre.cod_asociacion?.toString() || '', // cod_aso_padre -> cod_asociacion del padre
      padre_aso: padre.old_aso || '', // padre_aso -> old_aso del padre
      pru_aso_padre: padre.pru_aso || '' // pru_aso_padre -> pru_aso del padre
    });
    this.showPadreSelectionDialog = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Padre Seleccionado',
      detail: `Padre: ${padre.nomb_animal} (${padre.cod_finca}-${padre.cod_animal})`,
      life: 3000,
    });
  }

  onMadreSelected(madre: AnimalDto) {
    this.selectedMadre = madre;
    this.animalForm.patchValue({
      // Mapeo según los requerimientos:
      cod_finca_madre: madre.cod_finca_actual || madre.cod_finca, // cod_finca_madre -> cod_finca_actual de la madre
      cod_madre: madre.cod_animal, // cod_madre -> cod_animal de la madre
      nombre_madre: madre.nomb_animal,
      cri_madre: madre.cod_criador?.toString() || '', // cri_madre -> cod_criador de la madre
      nro_reg_madre: madre.nro_registro_cla || '', // nro_reg_madre -> nro_registro_cla de la madre
      cod_aso_madre: madre.cod_asociacion?.toString() || '', // cod_aso_madre -> cod_asociacion de la madre
      madre_aso: madre.old_aso || '', // madre_aso -> old_aso de la madre
      pru_aso_madre: madre.pru_aso || '' // pru_aso_madre -> pru_aso de la madre
    });
    this.showMadreSelectionDialog = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Madre Seleccionada',
      detail: `Madre: ${madre.nomb_animal} (${madre.cod_finca}-${madre.cod_animal})`,
      life: 3000,
    });
  }

  clearPadre() {
    this.selectedPadre = null;
    this.animalForm.patchValue({
      cod_finca_padre: null,
      cod_padre: '',
      nombre_padre: '',
      cri_padre: '',
      nro_reg_padre: '',
      cod_aso_padre: '',
      padre_aso: '',
      pru_aso_padre: ''
    });
  }

  clearMadre() {
    this.selectedMadre = null;
    this.animalForm.patchValue({
      cod_finca_madre: null,
      cod_madre: '',
      nombre_madre: '',
      cri_madre: '',
      nro_reg_madre: '',
      cod_aso_madre: '',
      madre_aso: '',
      pru_aso_madre: ''
    });
  }

  /**
   * Formatea una fecha para input de tipo date (YYYY-MM-DD)
   */
  private formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    
    // Si ya está en formato YYYY-MM-DD, devolverla tal como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Si está en formato DD/MM/YYYY, convertirla
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }
    
    // Intentar parsear como fecha y formatear
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Error al formatear fecha:', dateString, error);
    }
    
    return '';
  }

  /**
   * Carga los nombres de padre y madre cuando se edita un animal
   */
  private loadParentNames(animal: AnimalDto): void {
    // Cargar nombre del padre si existe
    if (animal.cod_finca_padre && animal.cod_padre) {
      this.animalsService.getAnimalById$(animal.cod_finca_padre!.toString(), animal.cod_padre).subscribe({
        next: (padre: AnimalDto) => {
          if (padre) {
            this.animalForm.patchValue({
              nombre_padre: padre.nomb_animal
            });
          }
        },
        error: (error: any) => {
          console.warn('No se pudo cargar el nombre del padre:', error);
        }
      });
    }

    // Cargar nombre de la madre si existe
    if (animal.cod_finca_madre && animal.cod_madre) {
      this.animalsService.getAnimalById$(animal.cod_finca_madre!.toString(), animal.cod_madre).subscribe({
        next: (madre: AnimalDto) => {
          if (madre) {
            this.animalForm.patchValue({
              nombre_madre: madre.nomb_animal
            });
          }
        },
        error: (error: any) => {
          console.warn('No se pudo cargar el nombre de la madre:', error);
        }
      });
    }
  }

  // Métodos para mapear valores de enums
  getOrigenLabel(origen: string): string {
    switch (origen) {
      case 'N': return 'Nacido en Finca';
      case 'E': return 'Extranjero';
      case 'S': return 'Compra Socio';
      case 'I': return 'Compra Independiente';
      case 'C': return 'Comprado';
      default: return origen || 'N/A';
    }
  }

  getTipoConcepcionLabel(tipo: string): string {
    switch (tipo) {
      case 'M': return 'Monta Natural';
      case 'F': return 'TE Fresco';
      case 'C': return 'TE Congelado';
      case 'I': return 'Inseminación Artificial';
      default: return tipo || 'N/A';
    }
  }

  getTipoPartoLabel(tipo: string): string {
    switch (tipo) {
      case 'S': return 'Simple';
      case 'D': return 'Doble';
      case 'T': return 'Triple';
      case 'C': return 'Cuádruple';
      case 'Q': return 'Quíntuple';
      default: return tipo || 'N/A';
    }
  }

  getPurezaSangreLabel(pureza: string): string {
    switch (pureza) {
      case 'O': return 'PO';
      case 'C': return 'PCOC';
      case 'T': return 'PR';
      case 'B': return 'BASE';
      case '1': return 'G1';
      case '2': return 'G2';
      case '3': return 'G3';
      case '4': return 'G4';
      default: return pureza || 'N/A';
    }
  }

  getSexoLabel(sexo: string): string {
    switch (sexo) {
      case 'M': return 'Macho';
      case 'H': return 'Hembra';
      default: return sexo || 'N/A';
    }
  }

  getEstatusLabel(estatus: string): string {
    switch (estatus) {
      case 'A': return 'Activo';
      case 'R': return 'Referencia';
      case 'I': return 'Inactivo';
      default: return estatus || 'N/A';
    }
  }
}
