import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { firstValueFrom, BehaviorSubject, Subject } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  filter,
} from 'rxjs/operators';
import { AnimalsService, AnimalQueryParams } from './services/animals-service';
import { AnimalDto } from './models/DTOs/animal';
import { AnimalCreateDto } from './models/DTOs/animal-create';
import { AnimalUpdateDto } from './models/DTOs/animal-update';
import { AnimalListResponse } from './models/DTOs/animal-list-response';
import {
  ANIMAL_SEARCH_CONFIG,
  isValidSearchTerm,
} from './config/search-config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
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

@Component({
  selector: 'app-animals',
  templateUrl: './animals.html',
  styleUrl: './animals.css',
  providers: [MessageService, ConfirmationService, DatePipe],
  imports: [
    FormsModule,
    ButtonModule,
    FileUploadModule,
    DialogModule,
    ConfirmDialogModule,
    TableModule,
    TagModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    SelectModule,
    LucideAngularModule,
    TextareaModule,
    DatePipe,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
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
  selectedAnimals: AnimalDto[] = [];
  animal: Partial<AnimalDto> = {};
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

  // Opciones para los selects
  sexoOptions = [
    { label: 'Macho', value: 'M' },
    { label: 'Hembra', value: 'H' },
  ];

  statusOptions = [
    { label: 'ACTIVO', value: 'ACTIVO' },
    { label: 'Vendido', value: 'Vendido' },
    { label: 'Retirado', value: 'Retirado' },
    { label: 'Enfermo', value: 'Enfermo' },
  ];

  origenOptions = [
    { label: 'NACIDO EN FINCA', value: 'NACIDO EN FINCA' },
    { label: 'COMPRADO', value: 'COMPRADO' },
    { label: 'TRANSFERIDO', value: 'TRANSFERIDO' },
  ];

  tipoConcepcionOptions = [
    { label: 'MONTA NATURAL', value: 'MONTA NATURAL' },
    { label: 'INSEMINACION ARTIFICIAL', value: 'INSEMINACION ARTIFICIAL' },
    { label: 'TRANSFERENCIA EMBRIONARIA', value: 'TRANSFERENCIA EMBRIONARIA' },
  ];

  tipoPartoOptions = [
    { label: 'SIMPLE', value: 'SIMPLE' },
    { label: 'GEMELAR', value: 'GEMELAR' },
    { label: 'TRIPLE', value: 'TRIPLE' },
  ];

  materialGeneticoOptions = [
    { label: 'NACIONAL', value: 'NACIONAL' },
    { label: 'IMPORTADO', value: 'IMPORTADO' },
  ];

  protocoloImportacionOptions = [
    { label: 'SI', value: 'SI' },
    { label: 'NO', value: 'NO' },
  ];

  constructor(
    private animalsService: AnimalsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'cod_finca', header: 'Id Finca' },
      { field: 'nomb_animal', header: 'Nombre' },
      { field: 'fec_nacim', header: 'Fec Nac' },
      { field: 'sexo_animal', header: 'Sexo' },
      { field: 'imagen', header: 'Imagen' },
      { field: 'raza_info.nomb_raza', header: 'Raza' },
      { field: 'estatus', header: 'Estatus' },
      { field: 'origen', header: 'Origen' },
      { field: 'tipo_concepcion', header: 'Tipo Concepción' },
      { field: 'tipo_parto', header: 'Tipo Parto' },
      { field: 'comp_racial', header: 'C. Racial' },
      { field: 'porc_racial', header: '% Racial' },
      { field: 'criador.nomb_finca', header: 'Criador' },
      { field: 'propietario.nomb_finca', header: 'Propietario' },
    ];
    this.sortField = 'nomb_animal'; // Cambiar de 'cod_animal' a 'nomb_animal'

    // Configurar el pipe de búsqueda
    this.setupSearchPipe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.animal = {
      cod_finca: 1, // Valor por defecto
      cod_animal: '',
      nomb_animal: '',
      sexo_animal: 'M',
      estatus: 'ACTIVO',
      fec_nacim: new Date().toISOString().split('T')[0],
      fec_ingreso: new Date().toISOString().split('T')[0],
      cod_raza: 1,
      cod_color: 1,
      origen: 'NACIDO EN FINCA',
      tipo_concepcion: 'MONTA NATURAL',
      tipo_parto: 'SIMPLE',
      material_genetico: 'NACIONAL',
      protocolo_importacion: 'SI',
      peso_al_nacer: 0,
      fec_destete: '',
      peso_al_destete: 0,
      codigo_aso: '',
      tatuaje_oreja_izq: '',
      tatuaje_oreja_der: '',
      tatuaje_cola: '',
      comp_racial: 0,
      porc_racial: 0,
      precio_con_igv: 0,
      stock_minimo: 0,
      imagen: '',
    };
    this.isEditMode = false;
    this.animalDialog = true;
    this.submitted = false;
  }

  editAnimal(animal: AnimalDto) {
    this.animal = { ...animal };
    this.isEditMode = true;
    this.animalDialog = true;
    this.submitted = false;
  }

  deleteAnimal(animal: AnimalDto) {
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
                detail: 'Animal eliminado',
                life: 3000,
              });
            },
            error: (error) => {
              console.error('Error deleting animal:', error);
              this.loading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar el animal',
                life: 3000,
              });
            },
          });
      },
    });
  }

  deleteSelectedAnimals() {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar los animales seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        const deletes = this.selectedAnimals.map((a) =>
          this.animalsService.deleteAnimal$(a.cod_finca.toString(), a.cod_animal)
        );
        Promise.all(deletes.map((obs) => firstValueFrom(obs)))
          .then(() => {
            this.loadAnimals();
            this.selectedAnimals = [];
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminados',
              detail: 'Animales eliminados',
              life: 3000,
            });
          })
          .catch((error) => {
            console.error('Error deleting animals:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar los animales',
              life: 3000,
            });
          });
      },
    });
  }

  hideDialog() {
    this.animalDialog = false;
    this.animal = {};
    this.isEditMode = false;
    this.submitted = false;
  }

  saveAnimal() {
    this.submitted = true;

    // Validaciones requeridas según el backend
    if (
      !this.animal.cod_finca ||
      !this.animal.cod_animal ||
      !this.animal.nomb_animal ||
      !this.animal.sexo_animal
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Completa todos los campos obligatorios marcados con *',
        life: 3000,
      });
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      // Update - solo enviar campos que se pueden actualizar
      const updateData: AnimalUpdateDto = {
        nomb_animal: this.animal.nomb_animal,
        sexo_animal: this.animal.sexo_animal,

        estatus: this.animal.estatus,
        cod_raza: this.animal.cod_raza,
        peso_actual: this.animal.peso_actual,
        peso_al_nacer: this.animal.peso_al_nacer,
        fec_nacim: this.animal.fec_nacim,
        fec_ingreso: this.animal.fec_ingreso,
        cod_color: this.animal.cod_color,
        tatuaje: this.animal.tatuaje,
        observac: this.animal.observac,
      };

      this.animalsService
        .updateAnimal$(
          this.animal.cod_finca.toString(),
          this.animal.cod_animal,
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
        cod_finca: this.animal.cod_finca!,
        cod_animal: this.animal.cod_animal!,
        nomb_animal: this.animal.nomb_animal!,
        sexo_animal: this.animal.sexo_animal!,
        fec_ingreso:
          this.animal.fec_ingreso || new Date().toISOString().split('T')[0],
        estatus: this.animal.estatus || 'A',
        cod_raza: this.animal.cod_raza || 0,
        peso_actual: this.animal.peso_actual || 0,
        peso_al_nacer: this.animal.peso_al_nacer || 0,
        fec_nacim: this.animal.fec_nacim,
        cod_color: this.animal.cod_color || 0,
        tatuaje: this.animal.tatuaje || '',
        observac: this.animal.observac || '',
        foto: this.animal.foto || undefined,

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
}
