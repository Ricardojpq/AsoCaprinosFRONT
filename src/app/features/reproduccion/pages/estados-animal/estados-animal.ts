import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReproduccionService } from '../../services/reproduccion.service';

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
import { CheckboxModule } from 'primeng/checkbox';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LucideAngularModule, RefreshCw, History, Check, Filter } from 'lucide-angular';

@Component({
  selector: 'app-estados-animal',
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
    CheckboxModule,
    ToolbarModule,
    InputTextModule,
    TextareaModule,
    ConfirmDialogModule,
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './estados-animal.html'
})
export class EstadosAnimal implements OnInit {
  private reproduccionService = inject(ReproduccionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Lucide icons
  readonly refreshIcon = RefreshCw;
  readonly historyIcon = History;
  readonly checkIcon = Check;
  readonly filterIcon = Filter;

  // Data
  animales = signal<any[]>([]);
  tiposEstado = signal<any[]>([]);
  estadosDisponibles = signal<any[]>([]);
  fincas = signal<any[]>([]);
  loading = signal(false);

  // Filters
  selectedFinca = signal<number | null>(null);
  selectedSexo = signal<string | null>(null);

  // Selection
  selectedAnimales = signal<any[]>([]);

  // Dialog
  showCambiarEstadoDialog = signal(false);
  showHistorialDialog = signal(false);
  selectedAnimalForChange = signal<any | null>(null);
  historialAnimal = signal<any[]>([]);

  // Form
  selectedTipoEstado = signal<string | null>(null);
  selectedNuevoEstado = signal<string | null>(null);
  observaciones = '';

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
    this.reproduccionService.getFincas().subscribe({
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
    this.reproduccionService.getTiposEstado().subscribe({
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

    this.reproduccionService.getAnimalesConEstados(filters).subscribe({
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

  onTipoEstadoChange(): void {
    if (this.selectedTipoEstado()) {
      this.reproduccionService.getEstadosPorTipo(this.selectedTipoEstado()!).subscribe({
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
      this.reproduccionService.cambiarEstadoAnimal({
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
      this.reproduccionService.cambiarEstadoMasivo({
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
    this.showHistorialDialog.set(true);

    this.reproduccionService.getHistorialAnimal(animal.id).subscribe({
      next: (response) => {
        this.historialAnimal.set(response.data.data || []);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar historial'
        });
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
      'EN_MONTA': 'warn',
      'PREÑADA': 'info',
      'LACTANDO': 'info',
      'INACTIVO': 'secondary',
      'VENDIDO': 'secondary',
      'FALLECIDO': 'danger',
      'ENFERMO': 'danger'
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
}
