import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { CatalogsService, CatalogQueryParams } from '../services/catalogs-service';
import { 
  CondicionCorporalDto, 
  CondicionCorporalCreateDto, 
  CondicionCorporalUpdateDto 
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
  selector: 'app-physical-condition',
  templateUrl: './physical-condition.html',
  styleUrl: './physical-condition.css',
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
export class PhysicalCondition implements OnInit, OnDestroy {
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

  physicalConditions: CondicionCorporalDto[] = [];
  selectedPhysicalConditions: CondicionCorporalDto[] = [];
  physicalConditionForm!: FormGroup;
  physicalConditionDialog = false;
  isEditMode = false;
  currentPhysicalCondition: CondicionCorporalDto | null = null;
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
      { field: 'cod_condicion_corporal', header: 'ID' },
      { field: 'descripcion', header: 'Descripción' },
      { field: 'created_at', header: 'Fecha Creación' },
    ];

    // Configurar el pipe de búsqueda
    this.setupSearchPipe();
    this.loadPhysicalConditions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.physicalConditionForm = this.fb.group({
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
        this.loadPhysicalConditions();
      });
  }

  /**
   * Limpia la búsqueda y recarga los datos
   */
  clearSearch() {
    this.globalFilterValue = '';
    this.searchSubject$.next('');
    this.filters['descripcion'] = undefined;
    this.loadPhysicalConditions();
  }

  loadPhysicalConditions(event?: any) {
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
    this.catalogsService.getBodyConditions$(query).subscribe({
      next: (res) => {
        this.physicalConditions = res.data || [];
        this.totalRecords = res.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading physical conditions:', error);
        this.physicalConditions = [];
        this.totalRecords = 0;
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las condiciones corporales',
          life: 3000,
        });
      },
    });
  }

  onTableLazyLoad(event: any) {
    this.loadPhysicalConditions(event);
  }

  onGlobalFilter(event: any) {
    const searchTerm = event.target.value;
    this.globalFilterValue = searchTerm;
    this.searchSubject$.next(searchTerm);
  }

  openNew() {
    this.physicalConditionForm.reset();
    this.isEditMode = false;
    this.currentPhysicalCondition = null;
    this.physicalConditionDialog = true;
    this.submitted = false;
  }

  editPhysicalCondition(physicalCondition: CondicionCorporalDto) {
    this.currentPhysicalCondition = physicalCondition;
    this.physicalConditionForm.patchValue({
      descripcion: physicalCondition.descripcion,
    });
    this.isEditMode = true;
    this.physicalConditionDialog = true;
    this.submitted = false;
  }

  deletePhysicalCondition(physicalCondition: CondicionCorporalDto) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar la condición corporal "${physicalCondition.descripcion}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.catalogsService.deleteBodyCondition$(physicalCondition.cod_condicion_corporal).subscribe({
          next: () => {
            this.loadPhysicalConditions();
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Condición corporal eliminada',
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error deleting physical condition:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la condición corporal',
              life: 3000,
            });
          },
        });
      },
    });
  }

  deleteSelectedPhysicalConditions() {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar las condiciones corporales seleccionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        const deletes = this.selectedPhysicalConditions.map((physicalCondition) =>
          this.catalogsService.deleteBodyCondition$(physicalCondition.cod_condicion_corporal)
        );
        Promise.all(deletes.map((obs) => firstValueFrom(obs)))
          .then(() => {
            this.loadPhysicalConditions();
            this.selectedPhysicalConditions = [];
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminados',
              detail: 'Condiciones corporales eliminadas',
              life: 3000,
            });
          })
          .catch((error) => {
            console.error('Error deleting physical conditions:', error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar las condiciones corporales',
              life: 3000,
            });
          });
      },
    });
  }

  hideDialog() {
    this.physicalConditionDialog = false;
    this.physicalConditionForm.reset();
    this.isEditMode = false;
    this.currentPhysicalCondition = null;
    this.submitted = false;
  }

  savePhysicalCondition() {
    this.submitted = true;

    if (this.physicalConditionForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Completa todos los campos obligatorios',
        life: 3000,
      });
      return;
    }

    this.loading = true;
    const formData = this.physicalConditionForm.value;

    if (this.isEditMode) {
      // Update
      const updateData: CondicionCorporalUpdateDto = {
        descripcion: formData.descripcion,
      };

      if (!this.currentPhysicalCondition) {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo identificar la condición corporal a actualizar',
          life: 3000,
        });
        return;
      }

      this.catalogsService.updateBodyCondition$(this.currentPhysicalCondition.cod_condicion_corporal, updateData).subscribe({
        next: () => {
          this.loadPhysicalConditions();
          this.physicalConditionDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Condición corporal actualizada',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error updating physical condition:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la condición corporal',
            life: 5000,
          });
        },
      });
    } else {
      // Create
      const createData: CondicionCorporalCreateDto = {
        descripcion: formData.descripcion,
      };

      this.catalogsService.createBodyCondition$(createData).subscribe({
        next: () => {
          this.loadPhysicalConditions();
          this.physicalConditionDialog = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Condición corporal creada',
            life: 3000,
          });
        },
        error: (error: any) => {
          console.error('Error creating physical condition:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la condición corporal',
            life: 5000,
          });
        },
      });
    }
  }

  // Helper para acceder a los controls del formulario
  get f() {
    return this.physicalConditionForm.controls;
  }
}
