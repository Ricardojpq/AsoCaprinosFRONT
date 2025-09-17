import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { 
  CatalogsService, 
  TipoPeloDto, 
  TipoPeloCreateDto, 
  TipoPeloUpdateDto, 
  CatalogQueryParams,
  CatalogListResponse 
} from '../services/catalogs-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import {
  LucideAngularModule,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
} from 'lucide-angular';
import { DatePipe } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-hair-type',
  templateUrl: './hair-type.html',
  styleUrl: './hair-type.css',
  providers: [MessageService, ConfirmationService],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    ConfirmDialogModule,
    TableModule,
    TagModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    LucideAngularModule,
    DatePipe,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
  ],
})
export class HairType implements OnInit, OnDestroy {
  readonly trashIcon = Trash2;
  readonly pencilIcon = Pencil;
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly xIcon = X;

  // BehaviorSubject para el término de búsqueda
  private searchSubject$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  // Configuración de búsqueda
  readonly SEARCH_MIN_LENGTH = 2;
  private readonly SEARCH_DEBOUNCE_TIME = 300;

  hairTypes: TipoPeloDto[] = [];
  selectedHairTypes: TipoPeloDto[] = [];
  hairTypeForm!: FormGroup;
  hairTypeDialog = false;
  isEditMode = false;
  currentHairType: TipoPeloDto | null = null;
  cols: any[] = [];
  loading = false;
  submitted = false;
  totalRecords = 0;
  page = 1;
  perPage = 10;
  sortField = 'nomb_tipo_pelo';
  sortOrder: 'asc' | 'desc' = 'asc';
  filters: Partial<CatalogQueryParams> = {};
  globalFilterValue = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catalogsService: CatalogsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.cols = [
      { field: 'cod_tipo_pelo', header: 'ID' },
      { field: 'nomb_tipo_pelo', header: 'Nombre' },
      { field: 'created_at', header: 'Fecha Creación' },
    ];

    // Configurar el pipe de búsqueda
    this.setupSearchPipe();
    this.loadHairTypes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.hairTypeForm = this.fb.group({
      nomb_tipo_pelo: ['', [Validators.required, Validators.maxLength(30)]],
      // foto_tipo_pelo: [null], // Campo removido temporalmente
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
        filter((searchTerm) => !searchTerm || searchTerm.length >= this.SEARCH_MIN_LENGTH)
      )
      .subscribe((searchTerm) => {
        this.filters['nomb_tipo_pelo'] = searchTerm || undefined;
        this.loadHairTypes();
      });
  }

  /**
   * Limpia la búsqueda y recarga los datos
   */
  clearSearch() {
    this.globalFilterValue = '';
    this.searchSubject$.next('');
    this.filters['nomb_tipo_pelo'] = undefined;
    this.loadHairTypes();
  }

  loadHairTypes(event?: any) {
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
    const query: CatalogQueryParams = {
      page: this.page,
      per_page: this.perPage,
      sort_by: this.sortField,
      sort_dir: this.sortOrder,
      ...this.filters,
    };
    this.catalogsService.getTiposPelo$(query).subscribe({
      next: (res) => {
        this.hairTypes = res.data || [];
        this.totalRecords = res.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading hair types:', error);
        this.hairTypes = [];
        this.totalRecords = 0;
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los tipos de pelo',
          life: 3000,
        });
      },
    });
  }

  onTableLazyLoad(event: any) {
    this.loadHairTypes(event);
  }

  onGlobalFilter(event: any) {
    const searchTerm = event.target.value;
    this.globalFilterValue = searchTerm;
    this.searchSubject$.next(searchTerm);
  }

  openNew() {
    this.hairTypeForm.reset();
    this.isEditMode = false;
    this.currentHairType = null;
    this.hairTypeDialog = true;
    this.submitted = false;
  }

  editHairType(hairType: TipoPeloDto) {
    this.currentHairType = hairType;
    this.hairTypeForm.patchValue({
      nomb_tipo_pelo: hairType.nomb_tipo_pelo,
      // foto_tipo_pelo: hairType.foto_tipo_pelo, // Campo removido temporalmente
    });
    this.isEditMode = true;
    this.hairTypeDialog = true;
    this.submitted = false;
  }

  deleteHairType(hairType: TipoPeloDto) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar el tipo de pelo "${hairType.nomb_tipo_pelo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.catalogsService.deleteTipoPelo$(hairType.cod_tipo_pelo).subscribe({
          next: () => {
            this.loadHairTypes();
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Tipo de pelo eliminado',
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error deleting hair type:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el tipo de pelo',
              life: 3000,
            });
          },
        });
      },
    });
  }

  deleteSelectedHairTypes() {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar los tipos de pelo seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        const deletes = this.selectedHairTypes.map((hairType) =>
          this.catalogsService.deleteTipoPelo$(hairType.cod_tipo_pelo)
        );
        Promise.all(deletes.map((obs) => firstValueFrom(obs)))
          .then(() => {
            this.loadHairTypes();
            this.selectedHairTypes = [];
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminados',
              detail: 'Tipos de pelo eliminados',
              life: 3000,
            });
          })
          .catch((error) => {
            console.error('Error deleting hair types:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar los tipos de pelo',
              life: 3000,
            });
          });
      },
    });
  }

  hideDialog() {
    this.hairTypeDialog = false;
    this.hairTypeForm.reset();
    this.isEditMode = false;
    this.currentHairType = null;
    this.submitted = false;
  }

  saveHairType() {
    this.submitted = true;

    if (this.hairTypeForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Completa todos los campos obligatorios',
        life: 3000,
      });
      return;
    }

    this.loading = true;
    const formData = this.hairTypeForm.value;

    if (this.isEditMode) {
      // Update
      const updateData: TipoPeloUpdateDto = {
        nomb_tipo_pelo: formData.nomb_tipo_pelo,
        // foto_tipo_pelo: formData.foto_tipo_pelo, // Campo removido temporalmente
      };

      if (!this.currentHairType) {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo identificar el tipo de pelo a actualizar',
          life: 3000,
        });
        return;
      }

      this.catalogsService.updateTipoPelo$(this.currentHairType.cod_tipo_pelo, updateData).subscribe({
        next: () => {
          this.loadHairTypes();
          this.hairTypeDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Tipo de pelo actualizado',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error updating hair type:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el tipo de pelo',
            life: 5000,
          });
        },
      });
    } else {
      // Create
      const createData: TipoPeloCreateDto = {
        nomb_tipo_pelo: formData.nomb_tipo_pelo,
        // foto_tipo_pelo: formData.foto_tipo_pelo, // Campo removido temporalmente
      };

      this.catalogsService.createTipoPelo$(createData).subscribe({
        next: () => {
          this.loadHairTypes();
          this.hairTypeDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Tipo de pelo creado',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error creating hair type:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el tipo de pelo',
            life: 5000,
          });
        },
      });
    }
  }

  // Helper para acceder a los controles del formulario
  get f() {
    return this.hairTypeForm.controls;
  }
}
