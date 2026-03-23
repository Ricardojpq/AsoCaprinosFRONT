import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReproduccionService } from '../../services/reproduccion.service';
import { FincaContextService } from '@core/services/finca-context.service';
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
  templateUrl: './lactancia.html'
})
export class Lactancia implements OnInit {
  private reproduccionService = inject(ReproduccionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Lucide icons
  readonly arrowRightIcon = ArrowRight;
  readonly checkIcon = Check;

  private fincaContext = inject(FincaContextService);

  controles = signal<ControlLactancia[]>([]);
  estadisticas = signal<LactanciaEstadisticas | null>(null);
  loading = signal(false);
  totalRecords = signal(0);
  
  // Filtros
  filterCria = signal<string>('');
  filterMadre = signal<string>('');
  filterFechaInicio = signal<Date | null>(null);
  filterFechaFin = signal<Date | null>(null);
  filterEstado = signal<string | null>(null);

  showDesteteDialog = signal(false);
  selectedControl = signal<ControlLactancia | null>(null);
  pesoDestete = signal<number | null>(null);

  estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'Calostro', value: 'CALOSTRO' },
    { label: 'Lactando', value: 'LACTANDO' },
    { label: 'Destetado', value: 'DESTETADO' }
  ];

  ngOnInit(): void {
    this.loadControles();
    this.loadEstadisticas();
  }

  get selectedFinca(): number | null {
    return this.fincaContext.getSelectedFinca();
  }

  applyFilters(): void {
    this.loadControles();
  }

  clearFilters(): void {
    this.filterCria.set('');
    this.filterMadre.set('');
    this.filterFechaInicio.set(null);
    this.filterFechaFin.set(null);
    this.filterEstado.set(null);
    this.loadControles();
  }

  loadControles(): void {
    this.loading.set(true);
    const filters: any = {};
    
    // Usar finca del contexto global
    const fincaId = this.fincaContext.getSelectedFinca();
    if (fincaId) filters.cod_finca = fincaId;
    
    // Aplicar filtros de búsqueda
    if (this.filterCria()) filters.cria = this.filterCria();
    if (this.filterMadre()) filters.madre = this.filterMadre();
    if (this.filterFechaInicio()) filters.fecha_inicio = this.filterFechaInicio()?.toISOString().split('T')[0];
    if (this.filterFechaFin()) filters.fecha_fin = this.filterFechaFin()?.toISOString().split('T')[0];
    if (this.filterEstado()) filters.estado = this.filterEstado();

    this.reproduccionService.getControlesLactancia(filters).subscribe({
      next: (response) => {
        this.controles.set(response.data.data);
        this.totalRecords.set(response.data.total);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar controles de lactancia'
        });
        this.loading.set(false);
      }
    });
  }

  loadEstadisticas(): void {
    this.reproduccionService.getLactanciaEstadisticas(this.selectedFinca || undefined).subscribe({
      next: (response) => {
        this.estadisticas.set(response.data);
      },
      error: () => {
        console.error('Error al cargar estadísticas');
      }
    });
  }

  iniciarLactancia(control: ControlLactancia): void {
    this.confirmationService.confirm({
      message: '¿Confirma pasar esta cría a estado de lactancia?',
      header: 'Confirmar',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.reproduccionService.iniciarLactancia(control.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cría pasada a lactancia'
            });
            this.loadControles();
            this.loadEstadisticas();
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

  openDesteteDialog(control: ControlLactancia): void {
    this.selectedControl.set(control);
    this.pesoDestete.set(null);
    this.showDesteteDialog.set(true);
  }

  registrarDestete(): void {
    const control = this.selectedControl();
    if (!control) return;

    this.reproduccionService.registrarDestete(control.id, this.pesoDestete() || undefined).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Destete registrado exitosamente'
        });
        this.showDesteteDialog.set(false);
        this.loadControles();
        this.loadEstadisticas();
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

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'CALOSTRO': return 'warn';
      case 'LACTANDO': return 'info';
      case 'DESTETADO': return 'success';
      default: return 'secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'CALOSTRO': 'Calostro',
      'LACTANDO': 'Lactando',
      'DESTETADO': 'Destetado'
    };
    return labels[estado] || estado;
  }
}
