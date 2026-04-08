import { Component, EventEmitter, Input, OnDestroy, OnInit, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AnimalDto } from '../../models/DTOs/animal';
import { AnimalsService, AnimalQueryParams } from '../../services/animals-service';
import { FarmsService } from '../../../farms/Services/farms-service';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LucideAngularModule, Search } from 'lucide-angular';
@Component({
  selector: 'app-animal-selection-table',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToolbarModule,
    TagModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    LucideAngularModule
],
  templateUrl: './animal-selection-table.html',
  styleUrl: './animal-selection-table.css'
})
export class AnimalSelectionTable implements OnInit, OnChanges, OnDestroy {
  @Input() visible: boolean = false;
  @Input() title: string = 'Seleccionar Animal';
  @Input() excludeAnimalId: string = ''; // Para excluir el animal actual
  @Input() sexFilter: 'H' | 'M' | '' = ''; // Filtro por sexo (para padre/madre)
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() animalSelected = new EventEmitter<AnimalDto>();

  readonly searchIcon = Search;

  animals: AnimalDto[] = [];
  selectedAnimal: AnimalDto | null = null;
  loading = false;
  totalRecords = 0;
  page = 1;
  perPage = 10;
  sortField = 'nomb_animal';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  // Búsqueda
  private searchSubject$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();
  globalFilterValue = '';

  // Opciones de filtros
  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activo', value: 'A' },
    { label: 'Inactivo', value: 'I' }
  ];

  fincaOptions: Array<{label: string, value: string}> = [];
  loadingFincas = false;

  // Filtros actuales
  filters = {
    sexo_animal: '',
    estatus: 'A', // Solo animales activos por defecto
    cod_finca: undefined as string | undefined
  };

  constructor(
    private animalsService: AnimalsService,
    private farmsService: FarmsService
  ) {}

  ngOnInit() {
    // Configurar búsqueda con debounce y filtro mínimo
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe(searchTerm => {
        this.globalFilterValue = searchTerm;
        this.page = 1;
        // Solo cargar si el diálogo está visible
        if (this.visible) {
          this.loadAnimals();
        }
      });

    // Aplicar filtro por sexo si se especifica
    if (this.sexFilter) {
      this.filters.sexo_animal = this.sexFilter;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Detectar cuando el modal se abre
    if (changes['visible'] && changes['visible'].currentValue === true) {
      this.loadFarms();
      this.loadAnimals();
    }
  }

  loadFarms() {
    this.loadingFincas = true;
    this.farmsService.getAllActiveFincas$(1000).subscribe({
      next: (fincas) => {
        this.fincaOptions = fincas.map(finca => ({
          label: finca.nomb_finca,
          value: finca.cod_finca.toString()
        }));
        this.loadingFincas = false;
      },
      error: (error) => {
        console.error('Error loading fincas:', error);
        this.fincaOptions = [];
        this.loadingFincas = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnimals(event?: any) {
    this.loading = true;
    
    // Manejar eventos de la tabla (paginación, ordenamiento)
    if (event) {
      this.page = Math.floor(event.first / event.rows) + 1;
      this.perPage = event.rows;
      if (event.sortField) {
        this.sortField = event.sortField;
        this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
      }
    }

    // Preparar parámetros de consulta
    const query: AnimalQueryParams = {
      page: this.page,
      per_page: this.perPage,
      sort_by: this.sortField,
      sort_dir: this.sortOrder,
      ...this.filters
    };

    // Agregar búsqueda global si existe
    if (this.globalFilterValue && this.globalFilterValue.trim()) {
      query.search = this.globalFilterValue.trim();
    }

    // Excluir animal actual si se especifica
    if (this.excludeAnimalId) {
      // Nota: El backend debería manejar la exclusión, pero por ahora filtramos en frontend
    }

    this.animalsService.getAnimals$(query).subscribe({
      next: (response) => {
        let animals = response.data || [];
        
        // Filtrar animal excluido en frontend si es necesario
        if (this.excludeAnimalId) {
          animals = animals.filter(animal => 
            `${animal.cod_finca}-${animal.cod_animal}` !== this.excludeAnimalId
          );
        }
        
        this.animals = animals;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading animals:', error);
        this.animals = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }

  onGlobalFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchSubject$.next(target.value);
  }

  onFilterChange() {
    this.page = 1; // Reset to first page when filtering
    this.loadAnimals();
  }

  clearFilters() {
    this.globalFilterValue = '';
    this.page = 1; // Reset pagination
    this.filters = {
      sexo_animal: this.sexFilter, // Mantener filtro de sexo si existe
      estatus: 'A',
      cod_finca: undefined as string | undefined
    };
    this.searchSubject$.next('');
    // loadAnimals se llamará automáticamente por el searchSubject subscription
  }

  onRowSelect(event: any) {
    this.selectedAnimal = event.data;
  }

  onRowUnselect(event: any) {
    this.selectedAnimal = null;
  }

  selectAnimal() {
    if (this.selectedAnimal) {
      this.animalSelected.emit(this.selectedAnimal);
      this.hideDialog();
    }
  }

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.selectedAnimal = null;
    this.globalFilterValue = '';
    this.searchSubject$.next('');
  }

  getSexLabel(sex: string): string {
    return sex === 'H' ? 'Hembra' : sex === 'M' ? 'Macho' : sex;
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'A':
        return 'success';
      case 'I':
        return 'danger';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'A':
        return 'Activo';
      case 'I':
        return 'Inactivo';
      default:
        return status;
    }
  }

  getFincaName(codFinca: string | undefined): string {
    if (!codFinca) return '';
    const finca = this.fincaOptions.find(f => f.value === codFinca);
    return finca?.label || '';
  }
}

