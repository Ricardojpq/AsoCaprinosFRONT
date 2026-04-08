import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReproductionService } from '../../services/reproduction.service';

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
  templateUrl: './animal-status.html'
})
export class AnimalStatus implements OnInit {
  private reproductionService = inject(ReproductionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Lucide icons
  readonly refreshIcon = RefreshCw;
  readonly historyIcon = History;
  readonly checkIcon = Check;
  readonly filterIcon = Filter;

  // Data
  animals = signal<any[]>([]);
  statusType = signal<any[]>([]);
  availableStatus = signal<any[]>([]);
  farms = signal<any[]>([]);
  loading = signal(false);

  // Filters
  selectedFarm = signal<number | null>(null);
  selectedGender = signal<string | null>(null);

  // Selection
  selectedAnimals = signal<any[]>([]);

  // Dialog
  showChangeStatusDialog = signal(false);
  showHistoryDialog = signal(false);
  selectedAnimalForChange = signal<any | null>(null);
  animalHistory = signal<any[]>([]);

  // Form
  selectedStatusType = signal<string | null>(null);
  selectedNewStatus = signal<string | null>(null);
  comments = '';

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
    this.reproductionService.getFarms().subscribe({
      next: (response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          this.farms.set(data);
        } else if (data && 'data' in data) {
          this.farms.set((data as any).data);
        }
        if (this.farms().length > 0) {
          this.selectedFarm.set(this.farms()[0].cod_finca);
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
    this.reproductionService.getTiposEstado().subscribe({
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

    this.reproductionService.getAnimalWithStatus(filters).subscribe({
      next: (response) => {
        this.animals.set(response.data);
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

  onTypeStatusChange(): void {
    if (this.selectedStatusType()) {
      this.reproductionService.getStatusByType(this.selectedStatusType()!).subscribe({
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

    const animalIds = this.selectedAnimals().map(a => a.id);

    if (animalIds.length === 1) {
      this.reproductionService.changeAnimalStatus({
        animal_id: animalIds[0],
        tipo_estado: this.selectedStatusType()!,
        nuevo_estado: this.selectedNewStatus()!,
        comments: this.comments || undefined
      }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Estado cambiado exitosamente'
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
      this.reproductionService.bulkUpdateStatus({
        animal_ids: animalIds,
        tipo_estado: this.selectedStatusType()!,
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

  openHistoryDialog(animal: any): void {
    this.selectedAnimalForChange.set(animal);
    this.animalHistory.set([]);
    this.showHistoryDialog.set(true);

    this.reproductionService.getAnimalHistory(animal.id).subscribe({
      next: (response) => {
        this.animalHistory.set(response.data.data || []);
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

  humanizaNameType(nombre: string): string {
    const nombres: Record<string, string> = {
      'ESTATUS_GENERAL': 'General',
      'ESTATUS_PRODUCTIVO': 'Productivo',
      'ESTATUS_REPRODUCTIVO': 'Reproductivo',
      'ETAPA_EVOLUTIVA': 'Etapa'
    };
    return nombres[nombre] || nombre.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  }
}
