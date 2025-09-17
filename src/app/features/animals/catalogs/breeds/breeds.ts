import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { 
  CatalogsService, 
  RazaDto, 
  RazaCreateDto, 
  RazaUpdateDto, 
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
  selector: 'app-breeds',
  templateUrl: './breeds.html',
  styleUrl: './breeds.css',
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
export class Breeds implements OnInit, OnDestroy {
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

  breeds: RazaDto[] = [];
  selectedBreeds: RazaDto[] = [];
  breedForm!: FormGroup;
  breedDialog = false;
  isEditMode = false;
  currentBreed: RazaDto | null = null;
  cols: any[] = [];
  loading = false;
  submitted = false;
  totalRecords = 0;
  page = 1;
  perPage = 10;
  sortField = 'descripcion';
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
      { field: 'cod_raza', header: 'ID' },
      { field: 'descripcion', header: 'Descripción' },
      { field: 'created_at', header: 'Fecha Creación' },
    ];

    // Configurar el pipe de búsqueda
    this.setupSearchPipe();
    this.loadBreeds();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.breedForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
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
        this.filters['descripcion'] = searchTerm || undefined;
        this.loadBreeds();
      });
  }

  /**
   * Limpia la búsqueda y recarga los datos
   */
  clearSearch() {
    this.globalFilterValue = '';
    this.searchSubject$.next('');
    this.filters['descripcion'] = undefined;
    this.loadBreeds();
  }

  loadBreeds(event?: any) {
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
    this.catalogsService.getRazas$(query).subscribe({
      next: (res) => {
        this.breeds = res.data || [];
        this.totalRecords = res.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading breeds:', error);
        this.breeds = [];
        this.totalRecords = 0;
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las razas',
          life: 3000,
        });
      },
    });
  }

  onTableLazyLoad(event: any) {
    this.loadBreeds(event);
  }

  onGlobalFilter(event: any) {
    const searchTerm = event.target.value;
    this.globalFilterValue = searchTerm;
    this.searchSubject$.next(searchTerm);
  }

  openNew() {
    this.breedForm.reset();
    this.isEditMode = false;
    this.currentBreed = null;
    this.breedDialog = true;
    this.submitted = false;
  }

  editBreed(breed: RazaDto) {
    this.currentBreed = breed;
    this.breedForm.patchValue({
      descripcion: breed.descripcion,
    });
    this.isEditMode = true;
    this.breedDialog = true;
    this.submitted = false;
  }

  deleteBreed(breed: RazaDto) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar la raza "${breed.descripcion}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.catalogsService.deleteRaza$(breed.cod_raza).subscribe({
          next: () => {
            this.loadBreeds();
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Raza eliminada',
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error deleting breed:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la raza',
              life: 3000,
            });
          },
        });
      },
    });
  }

  deleteSelectedBreeds() {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar las razas seleccionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        const deletes = this.selectedBreeds.map((breed) =>
          this.catalogsService.deleteRaza$(breed.cod_raza)
        );
        Promise.all(deletes.map((obs) => firstValueFrom(obs)))
          .then(() => {
            this.loadBreeds();
            this.selectedBreeds = [];
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminados',
              detail: 'Razas eliminadas',
              life: 3000,
            });
          })
          .catch((error) => {
            console.error('Error deleting breeds:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar las razas',
              life: 3000,
            });
          });
      },
    });
  }

  hideDialog() {
    this.breedDialog = false;
    this.breedForm.reset();
    this.isEditMode = false;
    this.currentBreed = null;
    this.submitted = false;
  }

  saveBreed() {
    this.submitted = true;

    if (this.breedForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Completa todos los campos obligatorios',
        life: 3000,
      });
      return;
    }

    this.loading = true;
    const formData = this.breedForm.value;

    if (this.isEditMode) {
      // Update
      const updateData: RazaUpdateDto = {
        descripcion: formData.descripcion,
      };

      if (!this.currentBreed) {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo identificar la raza a actualizar',
          life: 3000,
        });
        return;
      }

      this.catalogsService.updateRaza$(this.currentBreed.cod_raza, updateData).subscribe({
        next: () => {
          this.loadBreeds();
          this.breedDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Raza actualizada',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error updating breed:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la raza',
            life: 5000,
          });
        },
      });
    } else {
      // Create
      const createData: RazaCreateDto = {
        descripcion: formData.descripcion,
      };

      this.catalogsService.createRaza$(createData).subscribe({
        next: () => {
          this.loadBreeds();
          this.breedDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Raza creada',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error creating breed:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la raza',
            life: 5000,
          });
        },
      });
    }
  }

  // Helper para acceder a los controles del formulario
  get f() {
    return this.breedForm.controls;
  }
}
