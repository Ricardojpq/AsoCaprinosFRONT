import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { BadgeModule } from 'primeng/badge';
import { LucideAngularModule, RefreshCw, History, Check, Filter, Search, ChevronRight, ArrowRight, Info } from 'lucide-angular';

import { EstadoAnimalService } from '@core/services/estado-animal.service';

@Component({
  selector: 'app-estados-reproductivos',
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
    BadgeModule,
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './reproductive-status.html'
})
export class EstadosReproductivosComponent implements OnInit {
  private estadoAnimalService = inject(EstadoAnimalService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Lucide icons
  readonly refreshIcon = RefreshCw;
  readonly historyIcon = History;
  readonly checkIcon = Check;
  readonly filterIcon = Filter;
  readonly searchIcon = Search;
  readonly chevronRightIcon = ChevronRight;
  readonly arrowRightIcon = ArrowRight;
  readonly infoIcon = Info;

  // Data
  animales = signal<any[]>([]);
  estadosReproductivos = signal<any[]>([]);
  fincas = signal<any[]>([]);
  loading = signal(false);

  // Filters
  selectedFarm = signal<number | null>(null);
  selectedGender = signal<string | null>(null);
  selectedEstadoFiltro = signal<string | null>(null);
  searchTerm = signal('');

  // Selection
  selectedAnimals = signal<any[]>([]);

  // Dialog
  showChangeStatusDialog = signal(false);
  showHistoryDialog = signal(false);
  showTransicionesDialog = signal(false);
  selectedAnimalForChange = signal<any | null>(null);
  animalHistory = signal<any[]>([]);
  loadingHistorial = signal(false);

  // Form
  selectedNewStatus = signal<string | null>(null);
  comments = '';

  sexoOptions = [
    { label: 'Todos', value: null },
    { label: 'Machos', value: 'M' },
    { label: 'Hembras', value: 'H' }
  ];

  // Transiciones válidas del ciclo reproductivo
  // Hembras tienen ciclo completo, machos solo DESCANSO <-> EN_MONTA
  transicionesHembra: Record<string, string[]> = {
    'CELO': ['EN_MONTA'],
    'EN_MONTA': ['PREÑADA', 'VACIA'],
    'PREÑADA': ['LACTANDO', 'PARIDA', 'ABORTO'],
    'PARIDA': ['LACTANDO', 'DESCANSO'],
    'LACTANDO': ['SECA'],
    'SECA': ['DESCANSO'],
    'DESCANSO': ['CELO'],
    'VACIA': ['DESCANSO', 'CELO'],
    'ABORTO': ['DESCANSO']
  };

  transicionesMacho: Record<string, string[]> = {
    'DESCANSO': ['EN_MONTA'],
    'EN_MONTA': ['DESCANSO']
  };

  // Computed: estados disponibles según el estado actual y sexo del animal
  estadosDisponiblesParaTransicion = computed(() => {
    const animales = this.selectedAnimals();
    if (animales.length === 0) return this.estadosReproductivos();

    // Si hay múltiples animales, mostrar todos los estados (el backend validará)
    if (animales.length > 1) return this.estadosReproductivos();

    const animal = animales[0];
    const sexoAnimal = animal?.sexo_animal;
    const esMacho = sexoAnimal === 'M';

    // Filtrar por sexo del animal
    let estadosFiltrados = this.estadosReproductivos().filter(e => 
      !e.sexo || e.sexo === sexoAnimal
    );

    // Para un solo animal, filtrar según transiciones válidas
    const estadoActual = this.getEstadoReproductivo(animal);
    const transiciones = esMacho ? this.transicionesMacho : this.transicionesHembra;
    const transicionesPermitidas = transiciones[estadoActual] || [];
    
    if (transicionesPermitidas.length === 0) {
      return estadosFiltrados;
    }

    return estadosFiltrados.filter(e => 
      transicionesPermitidas.includes(e.nombre)
    );
  });

  ngOnInit(): void {
    this.loadFarms();
    this.loadEstadosReproductivos();
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

  loadEstadosReproductivos(sexo?: string): void {
    this.estadoAnimalService.getStatusByType('ESTATUS_REPRODUCTIVO', sexo).subscribe({
      next: (response) => {
        this.estadosReproductivos.set(response.data);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar estados reproductivos'
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

    // Filter by estado reproductivo
    if (this.selectedEstadoFiltro()) {
      result = result.filter(a => 
        this.getEstadoReproductivo(a) === this.selectedEstadoFiltro()
      );
    }

    return result;
  }

  getEstadoReproductivo(animal: any): string {
    if (animal.estados_actuales && animal.estados_actuales['ESTATUS_REPRODUCTIVO']) {
      return animal.estados_actuales['ESTATUS_REPRODUCTIVO'].estado?.nombre || '-';
    }
    return '-';
  }

  getConteoEstado(estadoNombre: string): number {
    return this.animales().filter(a => this.getEstadoReproductivo(a) === estadoNombre).length;
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
    this.selectedNewStatus.set(null);
    this.comments = '';
    this.showChangeStatusDialog.set(true);
  }

  changeStatus(): void {
    if (!this.selectedNewStatus()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione el nuevo estado'
      });
      return;
    }

    const animalIds = this.selectedAnimals().map(a => a.id);

    if (animalIds.length === 1) {
      this.estadoAnimalService.changeStatus({
        animal_id: animalIds[0],
        tipo_estado: 'ESTATUS_REPRODUCTIVO',
        nuevo_estado: this.selectedNewStatus()!,
        comments: this.comments || undefined
      }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Estado reproductivo cambiado exitosamente'
          });
          this.showChangeStatusDialog.set(false);
          this.loadAnimals();
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
      this.estadoAnimalService.bulkUpdateStatus({
        animal_ids: animalIds,
        tipo_estado: 'ESTATUS_REPRODUCTIVO',
        nuevo_estado: this.selectedNewStatus()!,
        comments: this.comments || undefined
      }).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Estado cambiado en ${response.data.exitosos} animales`
          });
          this.showChangeStatusDialog.set(false);
          this.loadAnimals();
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

  // Cambio rápido de estado (un clic)
  cambioRapido(animal: any, nuevoEstado: string): void {
    this.confirmationService.confirm({
      message: `¿Cambiar estado de "${animal.nomb_animal || animal.cod_animal}" a ${nuevoEstado}?`,
      header: 'Confirmar Cambio',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.estadoAnimalService.changeStatus({
          animal_id: animal.id,
          tipo_estado: 'ESTATUS_REPRODUCTIVO',
          nuevo_estado: nuevoEstado,
          comments: `Cambio rápido: ${this.getEstadoReproductivo(animal)} → ${nuevoEstado}`
        }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Estado cambiado a ${nuevoEstado}`
            });
            this.loadAnimals();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al cambiar estado'
            });
          }
        });
      }
    });
  }

  getTransicionesDisponibles(animal: any): string[] {
    const estadoActual = this.getEstadoReproductivo(animal);
    const esMacho = animal?.sexo_animal === 'M';
    const transiciones = esMacho ? this.transicionesMacho : this.transicionesHembra;
    return transiciones[estadoActual] || [];
  }

  openHistoryDialog(animal: any): void {
    this.selectedAnimalForChange.set(animal);
    this.animalHistory.set([]);
    this.loadingHistorial.set(true);
    this.showHistoryDialog.set(true);

    this.estadoAnimalService.getAnimalHistory(animal.id, 'ESTATUS_REPRODUCTIVO').subscribe({
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

  openTransicionesDialog(): void {
    this.showTransicionesDialog.set(true);
  }

  getStatusSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'DESCANSO': 'success',
      'CELO': 'warn',
      'EN_MONTA': 'warn',
      'PREÑADA': 'info',
      'LACTANDO': 'info',
      'PARIDA': 'info',
      'SECA': 'secondary',
      'VACIA': 'secondary',
      'ABORTO': 'danger'
    };
    return severities[estado] || 'secondary';
  }

  setEstadoFiltro(estado: string | null): void {
    this.selectedEstadoFiltro.set(estado === this.selectedEstadoFiltro() ? null : estado);
  }
}
