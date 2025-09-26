import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideAngularModule, Search, X } from 'lucide-angular';
import { ToolbarModule } from 'primeng/toolbar';
import { AnimalsService, AnimalQueryParams } from '../../../animals/services/animals-service';
import { AnimalDto } from '../../../animals/models/DTOs/animal';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface AnimalSelectionDto {
  cod_animal: string;
  nomb_animal: string;
  sexo_animal: string;
  fec_nacim?: string;
  raza_info?: {
    nomb_raza?: string;
  };
  criador?: {
    nomb_finca?: string;
    persona?: {
      nomb_persona?: string;
      apell_persona?: string;
    };
  };
  propietario?: {
    nomb_finca?: string;
    persona?: {
      nomb_persona?: string;
      apell_persona?: string;
    };
  };
}

@Component({
  selector: 'app-animals-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    LucideAngularModule,
    ToolbarModule
  ],
  templateUrl: './animals-table.html',
  styleUrl: './animals-table.css'
})
export class AnimalsTable implements OnInit, OnDestroy, OnChanges {
  @Input() visible: boolean = false;
  @Input() title: string = 'Seleccionar Animal';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() animalSelected = new EventEmitter<AnimalSelectionDto>();

  animals: AnimalSelectionDto[] = [];
  selectedAnimal: AnimalSelectionDto | null = null;
  globalFilterValue: string = '';
  totalRecords: number = 0;

  // Properties for real data
  loading: boolean = false;
  page: number = 1;
  perPage: number = 10;
  sortField: string = 'cod_animal';
  sortOrder: string = 'asc';
  
  // Search functionality
  private searchSubject$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();
  
  // Icons
  readonly searchIcon = Search;
  readonly xIcon = X;

  constructor(private animalsService: AnimalsService) {}

  ngOnInit() {
    this.setupSearchPipe();
    // No cargar datos automáticamente - solo cuando se abra el modal
  }

  ngOnChanges(changes: SimpleChanges) {
    // Cargar datos solo cuando se abra el modal
    if (changes['visible'] && changes['visible'].currentValue === true && !changes['visible'].previousValue) {
      console.log('Animals modal opened, loading animals...');
      this.loadAnimals();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchPipe() {
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((searchTerm) => {
        this.globalFilterValue = searchTerm;
        this.page = 1;
        this.loadAnimals();
      });
  }

  loadAnimals() {
    this.loading = true;
    
    const params: AnimalQueryParams = {
      page: this.page,
      per_page: this.perPage,
      sort_by: this.sortField,
      sort_dir: this.sortOrder as 'asc' | 'desc',
      search: this.globalFilterValue || undefined
    };

    this.animalsService.getAnimals$(params).subscribe({
      next: (response: any) => {
        // El servicio ya devuelve la estructura de paginación directamente
        this.animals = this.mapAnimalsToSelection(response.data || []);
        this.totalRecords = response.total || 0;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading animals:', error);
        this.loading = false;
        this.animals = [];
        this.totalRecords = 0;
      }
    });
  }

  private mapAnimalsToSelection(animals: AnimalDto[]): AnimalSelectionDto[] {
    return animals.map(animal => ({
      cod_animal: animal.cod_animal,
      nomb_animal: animal.nomb_animal,
      sexo_animal: animal.sexo_animal,
      fec_nacim: animal.fec_nacim,
      raza_info: animal.raza_info,
      criador: animal.criador,
      propietario: animal.propietario
    }));
  }

  onGlobalFilter(event: any) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject$.next(searchTerm);
  }

  clearSearch() {
    this.searchSubject$.next('');
  }

  onTableLazyLoad(event: any) {
    this.page = (event.first / event.rows) + 1;
    this.perPage = event.rows;
    
    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    }
    
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
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'N/A';
    }
  }

  getOwnerName(owner?: { persona?: { nomb_persona?: string; apell_persona?: string } }): string {
    if (!owner?.persona) return 'N/A';
    const nombre = owner.persona.nomb_persona || '';
    const apellido = owner.persona.apell_persona || '';
    return `${nombre} ${apellido}`.trim() || 'N/A';
  }
}
