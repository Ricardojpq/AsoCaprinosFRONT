import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FarmContextService } from '@core/services/finca-context.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { LucideAngularModule } from 'lucide-angular';
import { Check, CheckCircle, Clock, RefreshCw, Heart, XCircle, CheckSquare, Inbox } from 'lucide-angular';
import { ReproductionService } from '../../services/reproduction.service';
import { TemporadaMontaHembra } from '../../models/temporada-monta.interface';

interface HembraDiagnostico extends TemporadaMontaHembra {
  selected?: boolean;
  diagnosticoSeleccionado?: 'PREÑADA' | 'VACIA' | null;
  diasDesdeFinMonta?: number;
  diasRestantes?: number;
}

interface Finca {
  cod_finca: number;
  nomb_finca: string;
}

@Component({
  selector: 'app-diagnostico-prenez',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    CheckboxModule,
    TooltipModule,
    ProgressSpinnerModule,
    TabsModule,
    BadgeModule,
    ToolbarModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pregnancy-diagnosis.html'
})
export class DiagnosticoPrenezComponent implements OnInit {
  private reproductionService = inject(ReproductionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Lucide icons
  readonly checkIcon = Check;
  readonly checkCircleIcon = CheckCircle;
  readonly clockIcon = Clock;
  readonly refreshIcon = RefreshCw;
  readonly heartIcon = Heart;
  readonly xCircleIcon = XCircle;
  readonly checkSquareIcon = CheckSquare;
  readonly inboxIcon = Inbox;

  private farmContext = inject(FarmContextService);

  // Signals
  diasEsperaDiagnostico = signal<number>(30);
  hembrasElegibles = signal<HembraDiagnostico[]>([]);
  hembrasPendientes = signal<HembraDiagnostico[]>([]);
  loading = signal(false);
  loadingPendientes = signal(false);
  procesando = signal(false);
  
  // Filtros
  filterBusqueda = '';
  filterStartDate: Date | null = null;
  filterEndDate: Date | null = null;
  
  // Filtros para pendientes
  filterBusquedaPendientes = '';
  filterFechaInicioPendientes: Date | null = null;
  filterFechaFinPendientes: Date | null = null;

  // Computed
  hembrasSeleccionadas = computed(() => 
    this.hembrasElegibles().filter(h => h.selected)
  );

  totalSeleccionadas = computed(() => this.hembrasSeleccionadas().length);

  todasSeleccionadas = computed(() => {
    const elegibles = this.hembrasElegibles();
    return elegibles.length > 0 && elegibles.every(h => h.selected);
  });

  algunaSeleccionada = computed(() => 
    this.hembrasElegibles().some(h => h.selected)
  );

  // Opciones de diagnóstico
  opcionesDiagnostico = [
    { label: 'PREÑADA', value: 'PREÑADA' },
    { label: 'VACÍA', value: 'VACIA' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  get selectedFarm(): number | null {
    return this.farmContext.getSelectedFarm();
  }

  applyFilters(): void {
    this.loadData();
  }

  clearFilters(): void {
    this.filterBusqueda = '';
    this.filterStartDate = null;
    this.filterEndDate = null;
    this.loadData();
  }

  clearFiltersPendientes(): void {
    this.filterBusquedaPendientes = '';
    this.filterFechaInicioPendientes = null;
    this.filterFechaFinPendientes = null;
    this.loadHembrasPendientes();
  }

  applyFiltersPendientes(): void {
    this.loadHembrasPendientes();
  }

  private formatDateForApi(date: Date | null): string | null {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadData(): void {
    this.loadHembrasElegibles();
    this.loadHembrasPendientes();
  }

  loadHembrasElegibles(): void {
    this.loading.set(true);
    const filters: any = { per_page: 100 };
    
    if (this.selectedFarm) filters.cod_finca = this.selectedFarm;
    if (this.filterBusqueda) filters.busqueda = this.filterBusqueda;
    if (this.filterStartDate) filters.fecha_inicio = this.formatDateForApi(this.filterStartDate);
    if (this.filterEndDate) filters.fecha_fin = this.formatDateForApi(this.filterEndDate);

    this.reproductionService.getHembrasParaDiagnostico(filters).subscribe({
      next: (response) => {
        const responseData = response.data || { hembras: [], diasEspera: 30 };
        if (responseData.diasEspera !== undefined) {
          this.diasEsperaDiagnostico.set(responseData.diasEspera);
        }
        const hembras = (responseData.hembras || []).map((h: TemporadaMontaHembra) => this.procesarHembra(h));
        this.hembrasElegibles.set(hembras);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar hembras para diagnóstico'
        });
        this.loading.set(false);
      }
    });
  }

  loadHembrasPendientes(): void {
    this.loadingPendientes.set(true);
    const filters: any = { per_page: 100 };
    
    if (this.selectedFarm) filters.cod_finca = this.selectedFarm;
    if (this.filterBusquedaPendientes) filters.busqueda = this.filterBusquedaPendientes;
    if (this.filterFechaInicioPendientes) filters.fecha_inicio = this.formatDateForApi(this.filterFechaInicioPendientes);
    if (this.filterFechaFinPendientes) filters.fecha_fin = this.formatDateForApi(this.filterFechaFinPendientes);

    this.reproductionService.getHembrasPendientesDiagnostico(filters).subscribe({
      next: (response) => {
        const responseData = response.data || { hembras: [], diasEspera: 30 };
        if (responseData.diasEspera !== undefined) {
          this.diasEsperaDiagnostico.set(responseData.diasEspera);
        }
        const hembras = (responseData.hembras || []).map((h: TemporadaMontaHembra) => this.procesarHembra(h));
        this.hembrasPendientes.set(hembras);
        this.loadingPendientes.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar hembras pendientes'
        });
        this.loadingPendientes.set(false);
      }
    });
  }

  private procesarHembra(hembra: TemporadaMontaHembra): HembraDiagnostico {
    // Usar fecha_fin de la temporada (maestro) para el cálculo
    const fechaFinStr = (hembra as any).temporada_monta?.fecha_fin;
    const fechaFin = fechaFinStr ? this.parseDateLocal(fechaFinStr) : null;
    
    let diasDesdeFinMonta = 0;
    let diasRestantes = 0;
    const diasEspera = this.diasEsperaDiagnostico();
    
    if (fechaFin) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaFinNorm = new Date(fechaFin);
      fechaFinNorm.setHours(0, 0, 0, 0);
      
      // Días transcurridos desde el fin de la temporada
      diasDesdeFinMonta = Math.floor((hoy.getTime() - fechaFinNorm.getTime()) / (1000 * 60 * 60 * 24));
      
      // Días restantes para cumplir el parámetro
      // Si diasDesdeFinMonta < diasEspera: faltan días (pendiente)
      // Si diasDesdeFinMonta >= diasEspera: ya está lista (elegible)
      diasRestantes = Math.max(0, diasEspera - diasDesdeFinMonta);
    }

    return {
      ...hembra,
      selected: false,
      diagnosticoSeleccionado: null,
      diasDesdeFinMonta,
      diasRestantes
    };
  }

  toggleSeleccionTodas(): void {
    const nuevoEstado = !this.todasSeleccionadas();
    this.hembrasElegibles.update(hembras => 
      hembras.map(h => ({ ...h, selected: nuevoEstado }))
    );
  }

  registrarDiagnosticoIndividual(hembra: HembraDiagnostico): void {
    if (!hembra.diagnosticoSeleccionado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione un resultado de diagnóstico'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Confirma registrar el diagnóstico "${hembra.diagnosticoSeleccionado}" para ${hembra.hembra?.nomb_animal}?`,
      header: 'Confirmar Diagnóstico',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, registrar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.procesando.set(true);
        this.reproductionService.registrarDiagnosticoPrenez({
          temporada_monta_hembra_id: hembra.id,
          resultado: hembra.diagnosticoSeleccionado!
        }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Diagnóstico registrado para ${hembra.hembra?.nomb_animal}`
            });
            this.loadData();
            this.procesando.set(false);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al registrar diagnóstico'
            });
            this.procesando.set(false);
          }
        });
      }
    });
  }

  registrarDiagnosticoMasivo(resultado: 'PREÑADA' | 'VACIA'): void {
    const seleccionadas = this.hembrasSeleccionadas();
    if (seleccionadas.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione al menos una hembra'
      });
      return;
    }

    const nombreResultado = resultado === 'PREÑADA' ? 'PREÑADA' : 'VACÍA';

    this.confirmationService.confirm({
      message: `¿Confirma registrar el diagnóstico "${nombreResultado}" para ${seleccionadas.length} hembra(s)?`,
      header: 'Confirmar Diagnóstico Masivo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, registrar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.procesando.set(true);
        const diagnosticos = seleccionadas.map(h => ({
          temporada_monta_hembra_id: h.id,
          resultado
        }));

        this.reproductionService.registrarDiagnosticoMasivo(diagnosticos).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Diagnóstico registrado para ${response.data.length} hembra(s)`
            });
            this.loadData();
            this.procesando.set(false);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al registrar diagnósticos'
            });
            this.procesando.set(false);
          }
        });
      }
    });
  }

  getEdadAnimal(fechaNacimiento: string | Date | undefined): string {
    if (!fechaNacimiento) return 'N/A';
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    const meses = Math.floor((hoy.getTime() - nacimiento.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (meses < 12) {
      return `${meses} meses`;
    }
    const años = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    return mesesRestantes > 0 ? `${años} años ${mesesRestantes} meses` : `${años} años`;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    // Parsear como fecha local para evitar desfase de timezone
    const d = typeof date === 'string' ? this.parseDateLocal(date) : date;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private parseDateLocal(dateStr: string): Date {
    // '2026-02-19' -> new Date(2026, 1, 19) en hora local (sin desfase UTC)
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
}
