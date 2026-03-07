import { Injectable, signal, computed } from '@angular/core';
import { AnimalDto } from '../models/DTOs/animal';
import { AnimalFilters } from '../models/interfaces/animal-filters.interface';
import { CatalogOptions } from '../models/interfaces/catalog-options.interface';

@Injectable()
export class AnimalsState {
  // Signals para datos
  private _animals = signal<AnimalDto[]>([]);
  private _loading = signal<boolean>(false);
  private _totalRecords = signal<number>(0);
  private _currentPage = signal<number>(1);
  private _perPage = signal<number>(10);
  private _sortField = signal<string>('nomb_animal');
  private _sortOrder = signal<'asc' | 'desc'>('asc');
  private _filters = signal<AnimalFilters>({});
  private _globalFilter = signal<string>('');
  private _selectedAnimal = signal<AnimalDto | null>(null);
  private _isEditMode = signal<boolean>(false);
  private _dialogVisible = signal<boolean>(false);

  // Signals para catálogos
  private _catalogOptions = signal<CatalogOptions | null>(null);
  private _catalogsLoading = signal<boolean>(false);

  // Computed signals
  readonly hasAnimals = computed(() => this._animals().length > 0);
  readonly totalPages = computed(() => 
    Math.ceil(this._totalRecords() / this._perPage())
  );
  readonly isFirstPage = computed(() => this._currentPage() === 1);
  readonly isLastPage = computed(() => 
    this._currentPage() === this.totalPages()
  );
  readonly hasFilters = computed(() => 
    Object.keys(this._filters()).length > 0 || this._globalFilter().length > 0
  );
  readonly catalogsReady = computed(() => 
    this._catalogOptions() !== null && !this._catalogsLoading()
  );

  // Getters públicos (read-only)
  readonly animals = this._animals.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._totalRecords.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly perPage = this._perPage.asReadonly();
  readonly sortField = this._sortField.asReadonly();
  readonly sortOrder = this._sortOrder.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly globalFilter = this._globalFilter.asReadonly();
  readonly selectedAnimal = this._selectedAnimal.asReadonly();
  readonly isEditMode = this._isEditMode.asReadonly();
  readonly dialogVisible = this._dialogVisible.asReadonly();
  readonly catalogOptions = this._catalogOptions.asReadonly();
  readonly catalogsLoading = this._catalogsLoading.asReadonly();

  // Métodos para actualizar el estado
  setAnimals(animals: AnimalDto[]): void {
    this._animals.set(animals);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setTotalRecords(total: number): void {
    this._totalRecords.set(total);
  }

  setCurrentPage(page: number): void {
    this._currentPage.set(page);
  }

  setPerPage(perPage: number): void {
    this._perPage.set(perPage);
  }

  setSortField(field: string): void {
    this._sortField.set(field);
  }

  setSortOrder(order: 'asc' | 'desc'): void {
    this._sortOrder.set(order);
  }

  setFilters(filters: AnimalFilters): void {
    this._filters.set(filters);
  }

  updateFilters(partialFilters: Partial<AnimalFilters>): void {
    this._filters.update(current => ({ ...current, ...partialFilters }));
  }

  clearFilters(): void {
    this._filters.set({});
    this._globalFilter.set('');
  }

  setGlobalFilter(filter: string): void {
    this._globalFilter.set(filter);
  }

  setSelectedAnimal(animal: AnimalDto | null): void {
    this._selectedAnimal.set(animal);
  }

  setEditMode(isEdit: boolean): void {
    this._isEditMode.set(isEdit);
  }

  setDialogVisible(visible: boolean): void {
    this._dialogVisible.set(visible);
  }

  setCatalogOptions(options: CatalogOptions): void {
    this._catalogOptions.set(options);
  }

  setCatalogsLoading(loading: boolean): void {
    this._catalogsLoading.set(loading);
  }

  // Métodos de utilidad
  addAnimal(animal: AnimalDto): void {
    this._animals.update(animals => [...animals, animal]);
    this._totalRecords.update(total => total + 1);
  }

  updateAnimal(updatedAnimal: AnimalDto): void {
    this._animals.update(animals =>
      animals.map(animal =>
        animal.cod_finca === updatedAnimal.cod_finca &&
        animal.cod_animal === updatedAnimal.cod_animal
          ? updatedAnimal
          : animal
      )
    );
  }

  removeAnimal(cod_finca: number, cod_animal: string): void {
    this._animals.update(animals =>
      animals.filter(
        animal =>
          !(animal.cod_finca === cod_finca && animal.cod_animal === cod_animal)
      )
    );
    this._totalRecords.update(total => Math.max(0, total - 1));
  }

  openNewDialog(): void {
    this._selectedAnimal.set(null);
    this._isEditMode.set(false);
    this._dialogVisible.set(true);
  }

  openEditDialog(animal: AnimalDto): void {
    this._selectedAnimal.set(animal);
    this._isEditMode.set(true);
    this._dialogVisible.set(true);
  }

  closeDialog(): void {
    this._dialogVisible.set(false);
    this._selectedAnimal.set(null);
    this._isEditMode.set(false);
  }

  reset(): void {
    this._animals.set([]);
    this._loading.set(false);
    this._totalRecords.set(0);
    this._currentPage.set(1);
    this._perPage.set(10);
    this._sortField.set('nomb_animal');
    this._sortOrder.set('asc');
    this._filters.set({});
    this._globalFilter.set('');
    this._selectedAnimal.set(null);
    this._isEditMode.set(false);
    this._dialogVisible.set(false);
  }
}
