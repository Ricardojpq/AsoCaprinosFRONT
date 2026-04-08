import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReproductionService } from '../../services/reproduction.service';
import { FarmContextService } from '@core/services/farm-context.service';
import { ControlLactancia, LactanciaEstadisticas } from '../../models';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { LucideAngularModule, ArrowRight, Check } from 'lucide-angular';

@Component({
  selector: 'app-lactancia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    TagModule,
    CardModule,
    ProgressSpinnerModule,
    TooltipModule,
    InputNumberModule,
    ConfirmDialogModule,
    DatePickerModule,
    SelectModule,
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './lactation.html'
})
export class Lactation implements OnInit {
  private reproductionService = inject(ReproductionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Lucide icons
  readonly arrowRightIcon = ArrowRight;
  readonly checkIcon = Check;

  private farmContext = inject(FarmContextService);

  controls = signal<ControlLactancia[]>([]);
  statistics = signal<LactanciaEstadisticas | null>(null);
  loading = signal(false);
  totalRecords = signal(0);
  
  // Filtros
  filterCria = signal<string>('');
  filterMother = signal<string>('');
  filterStartDate = signal<Date | null>(null);
  filterEndDate = signal<Date | null>(null);
  filterStatus = signal<string | null>(null);

  showDesteteDialog = signal(false);
  selectedControl = signal<ControlLactancia | null>(null);
  weaningWeight = signal<number | null>(null);

  statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Calostro', value: 'CALOSTRO' },
    { label: 'Lactando', value: 'LACTANDO' },
    { label: 'Destetado', value: 'DESTETADO' }
  ];

  ngOnInit(): void {
    this.loadControls();
    this.LoadStatistics();
  }

  get selectedFarm(): number | null {
    return this.farmContext.getSelectedFarm();
  }

  applyFilters(): void {
    this.loadControls();
  }

  clearFilters(): void {
    this.filterCria.set('');
    this.filterMother.set('');
    this.filterStartDate.set(null);
    this.filterEndDate.set(null);
    this.filterStatus.set(null);
    this.loadControls();
  }

  loadControls(): void {
    this.loading.set(true);
    const filters: any = {};
    
    // Usar finca del contexto global
    const fincaId = this.farmContext.getSelectedFarm();
    if (fincaId) filters.cod_finca = fincaId;
    
    // Aplicar filtros de búsqueda
    if (this.filterCria()) filters.cria = this.filterCria();
    if (this.filterMother()) filters.madre = this.filterMother();
    if (this.filterStartDate()) filters.fecha_inicio = this.filterStartDate()?.toISOString().split('T')[0];
    if (this.filterEndDate()) filters.fecha_fin = this.filterEndDate()?.toISOString().split('T')[0];
    if (this.filterStatus()) filters.estado = this.filterStatus();

    this.reproductionService.getLactationControls(filters).subscribe({
      next: (response) => {
        this.controls.set(response.data.data);
        this.totalRecords.set(response.data.total);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar controls de lactancia'
        });
        this.loading.set(false);
      }
    });
  }

  LoadStatistics(): void {
    this.reproductionService.getLactationStats(this.selectedFarm || undefined).subscribe({
      next: (response) => {
        this.statistics.set(response.data);
      },
      error: () => {
        console.error('Error al cargar estadísticas');
      }
    });
  }

  startLactation(control: ControlLactancia): void {
    this.confirmationService.confirm({
      message: '¿Confirma pasar esta cría a estado de lactancia?',
      header: 'Confirmar',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.reproductionService.startLactation(control.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cría pasada a lactancia'
            });
            this.loadControls();
            this.LoadStatistics();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al actualizar estado'
            });
          }
        });
      }
    });
  }

  openWeaningDialog (control: ControlLactancia): void {
    this.selectedControl.set(control);
    this.weaningWeight.set(null);
    this.showDesteteDialog.set(true);
  }

  registerWeaning(): void {
    const control = this.selectedControl();
    if (!control) return;

    this.reproductionService.registerWeaning(control.id, this.weaningWeight() || undefined).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Destete registrado exitosamente'
        });
        this.showDesteteDialog.set(false);
        this.loadControls();
        this.LoadStatistics();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al registrar destete'
        });
      }
    });
  }

  getStatusSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'CALOSTRO': return 'warn';
      case 'LACTANDO': return 'info';
      case 'DESTETADO': return 'success';
      default: return 'secondary';
    }
  }

  getStatusLabel(estado: string): string {
    const labels: Record<string, string> = {
      'CALOSTRO': 'Calostro',
      'LACTANDO': 'Lactando',
      'DESTETADO': 'Destetado'
    };
    return labels[estado] || estado;
  }
}
