import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FarmsService } from '../../../farms/Services/farms-service';
import { FincaDto, FincaSelectionDto } from '../../../farms/models/finca.dto';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';

@Component({
  selector: 'app-farms-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToolbarModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  templateUrl: './farms-table.component.html',
  styleUrls: ['./farms-table.component.css'],
  providers: [MessageService]
})
export class FarmsTableComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Input() title: string = 'Seleccionar Finca';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() fincaSelected = new EventEmitter<FincaDto>();

  farms: FincaSelectionDto[] = [];
  selectedFarm: FincaSelectionDto | null = null;
  globalFilterValue: string = '';
  totalRecords: number = 0;
  loading: boolean = false;
  
  // Pagination
  first: number = 0;
  rows: number = 10;
  
  // Search debounce
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Store complete farm data for selection
  private completeFarmsData: FincaDto[] = [];

  constructor(
    private farmsService: FarmsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.setupSearchDebounce();
    // No llamar loadFarms() aquí - se maneja con lazy loading
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(searchTerm => !searchTerm || searchTerm.length >= 3), // Mínimo 3 caracteres
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  onTableLazyLoad(event?: any) {
    this.loading = true;
    
    // Calculate pagination parameters from PrimeNG event
    const page = event ? Math.floor(event.first / event.rows) + 1 : 1;
    const perPage = event ? event.rows : this.rows;
    
    // Handle sorting from PrimeNG event
    let sortField = 'nomb_finca'; // default
    let sortOrder: 'asc' | 'desc' = 'asc';
    
    if (event?.sortField) {
      sortField = event.sortField;
      sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    }
    
    // Prepare query parameters
    const params = {
      page,
      per_page: perPage,
      sort_by: sortField,
      sort_dir: sortOrder,
      estatus_finca: 'A', // Only active farms
      search: this.globalFilterValue || undefined
    };

    this.farmsService.getFarms$(params).subscribe({
      next: (response) => {
        // Store complete data for selection
        this.completeFarmsData = response.data;
        
        // Transform to selection format for table display
        this.farms = response.data.map(farm => ({
          cod_finca: farm.cod_finca,
          ide_finca: farm.ide_finca,
          nomb_finca: farm.nomb_finca,
          estado: farm.estado?.nom_estado || 'N/A',
          municipio: farm.municipio?.nom_municipio || 'N/A',
          ciudad: farm.ciudad?.nom_ciudad || 'N/A',
          propietario: farm.propietario ? 
            `${farm.propietario.nom_persona} ${farm.propietario.ape_persona}` : 'N/A'
        }));
        
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading farms:', error);
        this.farms = [];
        this.totalRecords = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las fincas. Por favor, intente nuevamente.',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  private performSearch(searchTerm: string) {
    this.first = 0; // Reset pagination
    // Trigger lazy load with current parameters
    this.onTableLazyLoad({
      first: this.first,
      rows: this.rows
    });
  }

  onGlobalFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.globalFilterValue = target.value;
    this.searchSubject.next(target.value);
  }

  clear() {
    this.globalFilterValue = '';
    this.searchSubject.next('');
    this.first = 0;
    // Trigger lazy load to refresh data
    this.onTableLazyLoad({
      first: this.first,
      rows: this.rows
    });
  }

  onRowSelect(event: any) {
    this.selectedFarm = event.data;
  }

  onRowUnselect(event: any) {
    this.selectedFarm = null;
  }

  selectFarm() {
    if (this.selectedFarm) {
      // Find the complete farm data
      const completeFarm = this.completeFarmsData.find(f => f.cod_finca === this.selectedFarm!.cod_finca);
      if (completeFarm) {
        this.fincaSelected.emit(completeFarm);
        this.messageService.add({
          severity: 'success',
          summary: 'Finca Seleccionada',
          detail: `Se seleccionó la finca: ${completeFarm.nomb_finca}`
        });
        this.hideDialog();
      }
    }
  }

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.selectedFarm = null;
  }
}
