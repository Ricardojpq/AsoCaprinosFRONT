import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { LucideAngularModule, RefreshCw, History, Check, Filter, Search, ChevronRight } from 'lucide-angular';

import { EstadoAnimalService } from '@core/services/estado-animal.service';

@Component({
  selector: 'app-estados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    ToastModule,
    TagModule,
    CardModule,
    ProgressSpinnerModule,
    TooltipModule,
    ToolbarModule,
    InputTextModule,
    TextareaModule,
    ConfirmDialogModule,
    TabsModule,
    BadgeModule,
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './estados.html'
})
export class EstadosComponent implements OnInit {
  private estadoAnimalService = inject(EstadoAnimalService);
  private messageService = inject(MessageService);

  // Lucide icons
  readonly refreshIcon = RefreshCw;
  readonly historyIcon = History;
  readonly checkIcon = Check;
  readonly filterIcon = Filter;
  readonly searchIcon = Search;
  readonly chevronRightIcon = ChevronRight;

  // Data
  animales = signal<any[]>([]);
  statusType = signal<any[]>([]);
  availableStatus = signal<any[]>([]);
  fincas = signal<any[]>([]);
  loading = signal(false);

  // Filters
  selectedFarm = signal<number | null>(null);
  selectedGender = signal<string | null>(null);
  searchTerm = signal('');

  // Selection
  selectedAnimals = signal<any[]>([]);

  // Dialog
  savingEstado = signal(false);
  showChangeStatusDialog = signal(false);
  showHistoryDialog = signal(false);
  selectedAnimalForChange = signal<any | null>(null);
  animalHistory = signal<any[]>([]);
  loadingHistorial = signal(false);

  // Form
  selectedStatusType = signal<string | null>(null);
  selectedNewStatus = signal<string | null>(null);
  comments = '';

  // Active tab for tipo estado filter
  activeTipoEstadoTab = signal<string | null>(null);

  sexoOptions = [
    { label: 'Todos', value: null },
    { label: 'Machos', value: 'M' },
    { label: 'Hembras', value: 'H' }
  ];

  ngOnInit(): void {
    this.loadFarms();
    this.loadTypeStatus();
  }

  loadFarms(): void {
    this.estadoAnimalService.getFarms().subscribe({
      next: (response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          this.fincas.set(data);
        } else if (data && 'data' in data) {
          this.fincas.set((data as any).data);
        }
        if (this.fincas().length > 0) {
          this.selectedFarm.set(this.fincas()[0].cod_finca);
          this.loadAnimals();
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar fincas'
        });
      }
    });
  }

  loadTypeStatus(): void {
    this.estadoAnimalService.getTiposEstado().subscribe({
      next: (response) => {
        this.statusType.set(response.data);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar tipos de estado'
        });
      }
    });
  }

  loadAnimals(): void {
    this.loading.set(true);
    const filters: any = {};
    if (this.selectedFarm()) {
      filters.cod_finca = this.selectedFarm();
    }
    if (this.selectedGender()) {
      filters.sexo = this.selectedGender();
    }

    this.estadoAnimalService.getAnimalWithStatus(filters).subscribe({
      next: (response) => {
        this.animales.set(response.data);
        this.selectedAnimals.set([]);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar animales'
        });
        this.loading.set(false);
      }
    });
  }

  get filteredAnimales(): any[] {
    let result = this.animales();
    
    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      result = result.filter(a => 
        (a.nomb_animal?.toLowerCase().includes(term)) ||
        (a.cod_animal?.toLowerCase().includes(term))
      );
    }

    // Filter by tipo estado tab
    if (this.activeTipoEstadoTab()) {
      result = result.filter(a => {
        const estado = this.getCurrentStatus(a, this.activeTipoEstadoTab()!);
        return estado !== '-';
      });
    }

    return result;
  }

  onTypeStatusChange(): void {
    if (this.selectedStatusType()) {
      // Determinar el sexo para filtrar estados
      // Si hay un solo animal seleccionado, usar su sexo
      // Si hay múltiples, no filtrar (el backend validará cada uno)
      const sexo = this.selectedAnimals().length === 1 
        ? this.selectedAnimals()[0]?.sexo_animal 
        : undefined;

      this.estadoAnimalService.getStatusByType(this.selectedStatusType()!, sexo).subscribe({
        next: (response) => {
          this.availableStatus.set(response.data);
        }
      });
    } else {
      this.availableStatus.set([]);
    }
    this.selectedNewStatus.set(null);
  }

  openChangeStatusDialog(animal?: any): void {
    if (animal) {
      this.selectedAnimalForChange.set(animal);
      this.selectedAnimals.set([animal]);
    } else if (this.selectedAnimals().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione al menos un animal'
      });
      return;
    }
    this.selectedStatusType.set(null);
    this.selectedNewStatus.set(null);
    this.availableStatus.set([]);
    this.comments = '';
    this.showChangeStatusDialog.set(true);
  }

  changeStatus(): void {
    if (!this.selectedStatusType() || !this.selectedNewStatus()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione tipo y nuevo estado'
      });
      return;
    }

    this.savingEstado.set(true);
    const animalIds = this.selectedAnimals().map(a => a.id);

    if (animalIds.length === 1) {
      this.estadoAnimalService.changeStatus({
        animal_id: animalIds[0],
        tipo_estado: this.selectedStatusType()!,
        nuevo_estado: this.selectedNewStatus()!,
        comments: this.comments || undefined
      }).subscribe({
        next: () => {
          this.savingEstado.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Estado cambiado exitosamente'
          });
          this.showChangeStatusDialog.set(false);
          this.loadAnimals();
        },
        error: (error) => {
          this.savingEstado.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al cambiar estado'
          });
        }
      });
    } else {
      this.estadoAnimalService.bulkUpdateStatus({
        animal_ids: animalIds,
        tipo_estado: this.selectedStatusType()!,
        nuevo_estado: this.selectedNewStatus()!,
        comments: this.comments || undefined
      }).subscribe({
        next: (response) => {
          this.savingEstado.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Estado cambiado en ${response.data.exitosos} animales`
          });
          this.showChangeStatusDialog.set(false);
          this.loadAnimals();
        },
        error: (error) => {
          this.savingEstado.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al cambiar estados'
          });
        }
      });
    }
  }

  openHistoryDialog(animal: any): void {
    this.selectedAnimalForChange.set(animal);
    this.animalHistory.set([]);
    this.loadingHistorial.set(true);
    this.showHistoryDialog.set(true);

    this.estadoAnimalService.getAnimalHistory(animal.id).subscribe({
      next: (response: any) => {
        this.animalHistory.set(response.data?.data || response.data || []);
        this.loadingHistorial.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar historial'
        });
        this.loadingHistorial.set(false);
      }
    });
  }

  getCurrentStatus(animal: any, tipoNombre: string): string {
    if (animal.estados_actuales && animal.estados_actuales[tipoNombre]) {
      return animal.estados_actuales[tipoNombre].estado?.nombre || '-';
    }
    return '-';
  }

  getStatusSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'ACTIVO': 'success',
      'DISPONIBLE': 'success',
      'DESCANSO': 'success',
      'CELO': 'warn',
      'EN_MONTA': 'warn',
      'PREÑADA': 'info',
      'LACTANDO': 'info',
      'PARIDA': 'info',
      'SECA': 'secondary',
      'VACIA': 'secondary',
      'INACTIVO': 'secondary',
      'VENDIDO': 'secondary',
      'MUERTO': 'danger',
      'FALLECIDO': 'danger',
      'ENFERMO': 'danger',
      'ABORTO': 'danger'
    };
    return severities[estado] || 'secondary';
  }

  humanizaNameType(nombre: string): string {
    const nombres: Record<string, string> = {
      'ESTATUS_GENERAL': 'General',
      'ESTATUS_PRODUCTIVO': 'Productivo',
      'ESTATUS_REPRODUCTIVO': 'Reproductivo',
      'ETAPA_EVOLUTIVA': 'Etapa'
    };
    return nombres[nombre] || nombre.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  }

  getConteoEstado(tipoNombre: string): number {
    return this.animales().filter(a => this.getCurrentStatus(a, tipoNombre) !== '-').length;
  }

  setActiveTipoEstadoTab(tipo: string | null): void {
    this.activeTipoEstadoTab.set(tipo === this.activeTipoEstadoTab() ? null : tipo);
  }
}
