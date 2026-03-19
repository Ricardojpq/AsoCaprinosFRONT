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
  tiposEstado = signal<any[]>([]);
  estadosDisponibles = signal<any[]>([]);
  fincas = signal<any[]>([]);
  loading = signal(false);

  // Filters
  selectedFinca = signal<number | null>(null);
  selectedSexo = signal<string | null>(null);
  searchTerm = signal('');

  // Selection
  selectedAnimales = signal<any[]>([]);

  // Dialog
  showCambiarEstadoDialog = signal(false);
  showHistorialDialog = signal(false);
  selectedAnimalForChange = signal<any | null>(null);
  historialAnimal = signal<any[]>([]);
  loadingHistorial = signal(false);

  // Form
  selectedTipoEstado = signal<string | null>(null);
  selectedNuevoEstado = signal<string | null>(null);
  observaciones = '';

  // Active tab for tipo estado filter
  activeTipoEstadoTab = signal<string | null>(null);

  sexoOptions = [
    { label: 'Todos', value: null },
    { label: 'Machos', value: 'M' },
    { label: 'Hembras', value: 'H' }
  ];

  ngOnInit(): void {
    this.loadFincas();
    this.loadTiposEstado();
  }

  loadFincas(): void {
    this.estadoAnimalService.getFincas().subscribe({
      next: (response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          this.fincas.set(data);
        } else if (data && 'data' in data) {
          this.fincas.set((data as any).data);
        }
        if (this.fincas().length > 0) {
          this.selectedFinca.set(this.fincas()[0].cod_finca);
          this.loadAnimales();
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

  loadTiposEstado(): void {
    this.estadoAnimalService.getTiposEstado().subscribe({
      next: (response) => {
        this.tiposEstado.set(response.data);
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

  loadAnimales(): void {
    this.loading.set(true);
    const filters: any = {};
    if (this.selectedFinca()) {
      filters.cod_finca = this.selectedFinca();
    }
    if (this.selectedSexo()) {
      filters.sexo = this.selectedSexo();
    }

    this.estadoAnimalService.getAnimalesConEstados(filters).subscribe({
      next: (response) => {
        this.animales.set(response.data);
        this.selectedAnimales.set([]);
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
        const estado = this.getEstadoActual(a, this.activeTipoEstadoTab()!);
        return estado !== '-';
      });
    }

    return result;
  }

  onTipoEstadoChange(): void {
    if (this.selectedTipoEstado()) {
      // Determinar el sexo para filtrar estados
      // Si hay un solo animal seleccionado, usar su sexo
      // Si hay múltiples, no filtrar (el backend validará cada uno)
      const sexo = this.selectedAnimales().length === 1 
        ? this.selectedAnimales()[0]?.sexo_animal 
        : undefined;

      this.estadoAnimalService.getEstadosPorTipo(this.selectedTipoEstado()!, sexo).subscribe({
        next: (response) => {
          this.estadosDisponibles.set(response.data);
        }
      });
    } else {
      this.estadosDisponibles.set([]);
    }
    this.selectedNuevoEstado.set(null);
  }

  openCambiarEstadoDialog(animal?: any): void {
    if (animal) {
      this.selectedAnimalForChange.set(animal);
      this.selectedAnimales.set([animal]);
    } else if (this.selectedAnimales().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione al menos un animal'
      });
      return;
    }
    this.selectedTipoEstado.set(null);
    this.selectedNuevoEstado.set(null);
    this.estadosDisponibles.set([]);
    this.observaciones = '';
    this.showCambiarEstadoDialog.set(true);
  }

  cambiarEstado(): void {
    if (!this.selectedTipoEstado() || !this.selectedNuevoEstado()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione tipo y nuevo estado'
      });
      return;
    }

    const animalIds = this.selectedAnimales().map(a => a.id);

    if (animalIds.length === 1) {
      this.estadoAnimalService.cambiarEstado({
        animal_id: animalIds[0],
        tipo_estado: this.selectedTipoEstado()!,
        nuevo_estado: this.selectedNuevoEstado()!,
        observaciones: this.observaciones || undefined
      }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Estado cambiado exitosamente'
          });
          this.showCambiarEstadoDialog.set(false);
          this.loadAnimales();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al cambiar estado'
          });
        }
      });
    } else {
      this.estadoAnimalService.cambiarEstadoMasivo({
        animal_ids: animalIds,
        tipo_estado: this.selectedTipoEstado()!,
        nuevo_estado: this.selectedNuevoEstado()!,
        observaciones: this.observaciones || undefined
      }).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Estado cambiado en ${response.data.exitosos} animales`
          });
          this.showCambiarEstadoDialog.set(false);
          this.loadAnimales();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al cambiar estados'
          });
        }
      });
    }
  }

  openHistorialDialog(animal: any): void {
    this.selectedAnimalForChange.set(animal);
    this.historialAnimal.set([]);
    this.loadingHistorial.set(true);
    this.showHistorialDialog.set(true);

    this.estadoAnimalService.getHistorialAnimal(animal.id).subscribe({
      next: (response: any) => {
        this.historialAnimal.set(response.data?.data || response.data || []);
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

  getEstadoActual(animal: any, tipoNombre: string): string {
    if (animal.estados_actuales && animal.estados_actuales[tipoNombre]) {
      return animal.estados_actuales[tipoNombre].estado?.nombre || '-';
    }
    return '-';
  }

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
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

  humanizarNombreTipo(nombre: string): string {
    const nombres: Record<string, string> = {
      'ESTATUS_GENERAL': 'General',
      'ESTATUS_PRODUCTIVO': 'Productivo',
      'ESTATUS_REPRODUCTIVO': 'Reproductivo',
      'ETAPA_EVOLUTIVA': 'Etapa'
    };
    return nombres[nombre] || nombre.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  }

  getConteoEstado(tipoNombre: string): number {
    return this.animales().filter(a => this.getEstadoActual(a, tipoNombre) !== '-').length;
  }

  setActiveTipoEstadoTab(tipo: string | null): void {
    this.activeTipoEstadoTab.set(tipo === this.activeTipoEstadoTab() ? null : tipo);
  }
}
