import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideAngularModule, Search, X, User } from 'lucide-angular';
import { ToolbarModule } from 'primeng/toolbar';
import { ClassifiersService } from '../../../classifiers/services/classifiers-service';
import { ClasificadorDto, ClasificadorFilters } from '../../../classifiers/models/classifier.dto';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface ClasificadorSelectionDto {
  ced_clasificador: string;
  cod_clasificador: string;
  nom_persona: string;
  ape_persona: string;
  tel_persona?: string;
  email_persona?: string;
  stat_clasificador: string;
}

@Component({
  selector: 'app-clasificadores-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    LucideAngularModule,
    ToolbarModule
  ],
  templateUrl: './Clasificadores-table.html',
  styleUrls: ['./Clasificadores-table.css']
})
export class ClasificadoresTable implements OnInit, OnDestroy, OnChanges {
  @Input() visible: boolean = false;
  @Input() title: string = 'Seleccionar Clasificador';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() clasificadorSelected = new EventEmitter<ClasificadorSelectionDto>();
  
  clasificadores: ClasificadorSelectionDto[] = [];
  selectedClasificador: ClasificadorSelectionDto | null = null;
  globalFilterValue: string = '';
  totalRecords: number = 0;
  loading: boolean = false;
  page: number = 1;
  perPage: number = 10;
  sortField: string = 'ced_clasificador';
  sortOrder: string = 'asc';
  
  // Search functionality
  private searchSubject$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();
  
  // Icons
  readonly searchIcon = Search;
  readonly xIcon = X;
  readonly userIcon = User;

  constructor(private classifiersService: ClassifiersService) {}

  ngOnInit() {
    this.setupSearchPipe();
    // No cargar datos automáticamente - solo cuando se abra el modal
  }

  ngOnChanges(changes: SimpleChanges) {
    // Cargar datos solo cuando se abra el modal
    if (changes['visible'] && changes['visible'].currentValue === true && !changes['visible'].previousValue) {
      console.log('Modal opened, loading clasificadores...');
      this.loadClasificadores();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchPipe() {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((searchTerm: string) => {
      this.globalFilterValue = searchTerm;
      this.page = 1;
      this.performSearch(searchTerm);
    });
  }

  private performSearch(searchTerm: string) {
    if (searchTerm.trim()) {
      this.searchClasificadores();
    } else {
      this.loadClasificadores();
    }
  }

  private searchClasificadores() {
    this.loading = true;
    
    // Usar el método de búsqueda del servicio
    this.classifiersService.searchClasificadores(this.globalFilterValue, this.perPage).subscribe({
      next: (response: any) => {
        console.log('Search clasificadores response:', response);
        this.handleClasificadoresResponse(response);
      },
      error: (error: any) => {
        console.error('Error searching clasificadores:', error);
        // Fallback a loadClasificadores si falla la búsqueda
        this.loadClasificadores();
      }
    });
  }

  private loadClasificadores() {
    this.loading = true;
    
    // Cargar todos los clasificadores sin filtros de búsqueda
    const filters: ClasificadorFilters = {
      sort_by: this.sortField,
      sort_dir: this.sortOrder as 'asc' | 'desc'
    };

    console.log('Loading clasificadores with filters:', filters, 'page:', this.page, 'perPage:', this.perPage);

    this.classifiersService.getClasificadores(filters, this.page, this.perPage).subscribe({
      next: (response: any) => {
        console.log('Clasificadores response:', response);
        this.handleClasificadoresResponse(response);
      },
      error: (error: any) => {
        console.error('Error loading clasificadores with pagination, trying getAllActive:', error);
        // Fallback: intentar con getAllActiveClasificadores
        this.loadAllActiveClasificadores();
      }
    });
  }

  private loadAllActiveClasificadores() {
    this.classifiersService.getAllActiveClasificadores().subscribe({
      next: (clasificadores: any) => {
        console.log('All active clasificadores response:', clasificadores);
        
        let filteredData = clasificadores || [];
        
        // Aplicar filtro de búsqueda si existe
        if (this.globalFilterValue && this.globalFilterValue.trim()) {
          const searchTerm = this.globalFilterValue.toLowerCase();
          filteredData = filteredData.filter((c: any) => 
            (c.ced_clasificador && c.ced_clasificador.toLowerCase().includes(searchTerm)) ||
            (c.nom_persona && c.nom_persona.toLowerCase().includes(searchTerm)) ||
            (c.ape_persona && c.ape_persona.toLowerCase().includes(searchTerm))
          );
        }
        
        this.clasificadores = this.mapClasificadores(filteredData);
        this.totalRecords = filteredData.length;
        this.loading = false;
        
        console.log('Mapped clasificadores from getAllActive:', this.clasificadores);
      },
      error: (error: any) => {
        console.error('Error loading all active clasificadores:', error);
        this.loading = false;
        this.clasificadores = [];
        this.totalRecords = 0;
      }
    });
  }

  private handleClasificadoresResponse(response: any) {
    // Manejar diferentes estructuras de respuesta
    let data = [];
    let total = 0;
    
    if (response) {
      if (Array.isArray(response)) {
        // Si la respuesta es directamente un array
        data = response;
        total = response.length;
      } else if (response.data && response.data.data) {
        // Estructura Laravel: response.data.data contiene el array
        data = Array.isArray(response.data.data) ? response.data.data : [];
        total = response.data.total || 0;
      } else if (response.data) {
        // Si tiene estructura de paginación simple
        data = Array.isArray(response.data) ? response.data : [];
        total = response.total || response.data.length || 0;
      } else {
        // Fallback
        data = [];
        total = 0;
      }
    }
    
    this.clasificadores = this.mapClasificadores(data);
    this.totalRecords = total;
    this.loading = false;
    
    console.log('Mapped clasificadores:', this.clasificadores);
  }

  private mapClasificadores(clasificadores: any[]): ClasificadorSelectionDto[] {
    if (!Array.isArray(clasificadores)) {
      console.warn('Expected array but got:', clasificadores);
      return [];
    }
    
    return clasificadores.map(clasificador => {
      console.log('Mapping clasificador:', clasificador);
      
      return {
        ced_clasificador: clasificador.ced_clasificador || '',
        cod_clasificador: clasificador.cod_clasificador || '',
        nom_persona: clasificador.persona?.nom_persona || 'Sin nombre',
        ape_persona: clasificador.persona?.ape_persona || '',
        tel_persona: clasificador.persona?.tlf_persona || 
                    clasificador.persona?.cel_persona || 
                    '',
        email_persona: clasificador.persona?.email_persona || '',
        stat_clasificador: clasificador.stat_clasificador || 'A'
      };
    });
  }

  onGlobalFilter(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject$.next(value);
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
    
    this.loadClasificadores();
  }

  onRowSelect(event: any) {
    this.selectedClasificador = event.data;
  }

  onRowUnselect(event: any) {
    this.selectedClasificador = null;
  }

  selectClasificador() {
    if (this.selectedClasificador) {
      this.clasificadorSelected.emit(this.selectedClasificador);
      this.visible = false;
      this.visibleChange.emit(false);
    }
  }

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.selectedClasificador = null;
  }

  // Utility methods
  getFullName(clasificador: ClasificadorSelectionDto): string {
    return `${clasificador.nom_persona} ${clasificador.ape_persona}`.trim();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'I':
        return 'bg-red-100 text-red-800';
      case 'S':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'A':
        return 'Activo';
      case 'I':
        return 'Inactivo';
      case 'S':
        return 'Suspendido';
      default:
        return 'Desconocido';
    }
  }
}
