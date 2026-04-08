import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { CatalogsService, CatalogQueryParams } from '../services/catalogs-service';
import { 
  ColorDto, 
  ColorCreateDto, 
  ColorUpdateDto 
} from '../../../../core/models/DTOs';
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
  selector: 'app-colors',
  templateUrl: './colors.html',
  styleUrl: './colors.css',
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
export class Colors implements OnInit, OnDestroy {
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

  colors: ColorDto[] = [];
  selectedColors: ColorDto[] = [];
  colorForm!: FormGroup;
  colorDialog = false;
  isEditMode = false;
  currentColor: ColorDto | null = null;
  cols: any[] = [];
  loading = false;
  submitted = false;
  totalRecords = 0;
  page = 1;
  perPage = 10;
  sortField = 'nomb_color';
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
      { field: 'cod_color', header: 'ID' },
      { field: 'nomb_color', header: 'Nombre' },
      { field: 'imagen', header: 'Imagen' },
      { field: 'created_at', header: 'Fecha Creación' },
    ];

    // Configurar el pipe de búsqueda
    this.setupSearchPipe();
    this.loadColors();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.colorForm = this.fb.group({
      nomb_color: ['', [Validators.required, Validators.maxLength(30)]],
      // foto_color: [null], // Campo removido temporalmente
      imagen: ['', [Validators.maxLength(255)]],
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
        this.filters['nomb_color'] = searchTerm || undefined;
        this.loadColors();
      });
  }

  /**
   * Limpia la búsqueda y recarga los datos
   */
  clearSearch() {
    this.globalFilterValue = '';
    this.searchSubject$.next('');
    this.filters['nomb_color'] = undefined;
    this.loadColors();
  }

  loadColors(event?: any) {
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
    this.catalogsService.getColors$(query).subscribe({
      next: (res) => {
        this.colors = res.data || [];
        this.totalRecords = res.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading colors:', error);
        this.colors = [];
        this.totalRecords = 0;
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los colores',
          life: 3000,
        });
      },
    });
  }

  onTableLazyLoad(event: any) {
    this.loadColors(event);
  }

  onGlobalFilter(event: any) {
    const searchTerm = event.target.value;
    this.globalFilterValue = searchTerm;
    this.searchSubject$.next(searchTerm);
  }

  openNew() {
    this.colorForm.reset();
    this.isEditMode = false;
    this.currentColor = null;
    this.colorDialog = true;
    this.submitted = false;
  }

  editColor(color: ColorDto) {
    this.currentColor = color;
    this.colorForm.patchValue({
      nomb_color: color.nomb_color,
      // foto_color: color.foto_color, // Campo removido temporalmente
      imagen: color.imagen,
    });
    this.isEditMode = true;
    this.colorDialog = true;
    this.submitted = false;
  }

  deleteColor(color: ColorDto) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar el color "${color.nomb_color}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.catalogsService.deleteColor$(color.cod_color).subscribe({
          next: () => {
            this.loadColors();
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Color eliminado',
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error deleting color:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el color',
              life: 3000,
            });
          },
        });
      },
    });
  }

  deleteSelectedColors() {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar los colores seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        const deletes = this.selectedColors.map((color) =>
          this.catalogsService.deleteColor$(color.cod_color)
        );
        Promise.all(deletes.map((obs) => firstValueFrom(obs)))
          .then(() => {
            this.loadColors();
            this.selectedColors = [];
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminados',
              detail: 'Colores eliminados',
              life: 3000,
            });
          })
          .catch((error) => {
            console.error('Error deleting colors:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar los colores',
              life: 3000,
            });
          });
      },
    });
  }

  hideDialog() {
    this.colorDialog = false;
    this.colorForm.reset();
    this.isEditMode = false;
    this.currentColor = null;
    this.submitted = false;
  }

  saveColor() {
    this.submitted = true;

    if (this.colorForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Completa todos los campos obligatorios',
        life: 3000,
      });
      return;
    }

    this.loading = true;
    const formData = this.colorForm.value;

    if (this.isEditMode) {
      // Update
      const updateData: ColorUpdateDto = {
        nomb_color: formData.nomb_color,
        // foto_color: formData.foto_color, // Campo removido temporalmente
        imagen: formData.imagen,
      };

      if (!this.currentColor) {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo identificar el color a actualizar',
          life: 3000,
        });
        return;
      }

      this.catalogsService.updateColor$(this.currentColor.cod_color, updateData).subscribe({
        next: () => {
          this.loadColors();
          this.colorDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Color actualizado',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error updating color:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el color',
            life: 5000,
          });
        },
      });
    } else {
      // Create
      const createData: ColorCreateDto = {
        nomb_color: formData.nomb_color,
        // foto_color: formData.foto_color, // Campo removido temporalmente
        imagen: formData.imagen,
      };

      this.catalogsService.createColor$(createData).subscribe({
        next: () => {
          this.loadColors();
          this.colorDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Color creado',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error creating color:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el color',
            life: 5000,
          });
        },
      });
    }
  }

  // Helper para acceder a los controls del formulario
  get f() {
    return this.colorForm.controls;
  }
}
