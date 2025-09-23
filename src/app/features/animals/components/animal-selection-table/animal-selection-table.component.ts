import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
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
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-animal-selection-table',
  standalone: true,
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
    InputIconModule
  ],
  templateUrl: './animal-selection-table.component.html',
  styleUrls: ['./animal-selection-table.component.css']
})
export class AnimalSelectionTableComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Input() title: string = 'Seleccionar Animal';
  @Input() excludeAnimalId: string = ''; // Para excluir el animal actual
  @Input() sexFilter: 'H' | 'M' | '' = ''; // Filtro por sexo (para padre/madre)
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() animalSelected = new EventEmitter<AnimalDto>();

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
  sexOptions = [
    { label: 'Todos', value: '' },
    { label: 'Hembra', value: 'H' },
    { label: 'Macho', value: 'M' }
  ];

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activo', value: 'A' },
    { label: 'Inactivo', value: 'I' }
  ];

  // Filtros actuales
  filters = {
    sexo_animal: '',
    estatus: 'A' // Solo animales activos por defecto
  };

  constructor(private animalsService: AnimalsService) {}

  ngOnInit() {
    // Configurar búsqueda con debounce
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.globalFilterValue = searchTerm;
        this.loadAnimals();
      });

    // Aplicar filtro por sexo si se especifica
    if (this.sexFilter) {
      this.filters.sexo_animal = this.sexFilter;
    }
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

    const query: AnimalQueryParams = {
      page: this.page,
      per_page: this.perPage,
      sort_by: this.sortField,
      sort_dir: this.sortOrder,
      search: this.globalFilterValue || undefined,
      ...this.filters
    };

    this.animalsService.getAnimals$(query).subscribe({
      next: (response) => {
        this.animals = response.data || [];
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
    this.filters = {
      sexo_animal: this.sexFilter, // Mantener filtro de sexo si existe
      estatus: 'A'
    };
    this.searchSubject$.next('');
    this.loadAnimals();
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
}
