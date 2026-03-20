import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
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
import { LucideAngularModule } from 'lucide-angular';
import { Check, CheckCircle, Clock, RefreshCw, Heart, XCircle, CheckSquare, Inbox } from 'lucide-angular';
import { ReproduccionService } from '../../services/reproduccion.service';
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
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './diagnostico-prenez.html'
})
export class DiagnosticoPrenezComponent implements OnInit {
  private reproduccionService = inject(ReproduccionService);
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

  // Signals
  fincas = signal<Finca[]>([]);
  diasEsperaDiagnostico = signal<number>(30);
  selectedFinca = signal<number | null>(null);
  hembrasElegibles = signal<HembraDiagnostico[]>([]);
  hembrasPendientes = signal<HembraDiagnostico[]>([]);
  loading = signal(false);
  loadingPendientes = signal(false);
  procesando = signal(false);

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
    this.loadFincas();
  }

  loadFincas(): void {
    this.reproduccionService.getFincas().subscribe({
      next: (response) => {
        // La respuesta puede ser paginada o un array directo
        const data = response.data;
        if (Array.isArray(data)) {
          this.fincas.set(data);
        } else if (data && 'data' in data) {
          this.fincas.set((data as any).data);
        }
        // Auto-seleccionar primera finca si hay fincas
        if (this.fincas().length > 0 && !this.selectedFinca()) {
          this.selectedFinca.set(this.fincas()[0].cod_finca);
          this.loadData();
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

  onFincaChange(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadHembrasElegibles();
    this.loadHembrasPendientes();
  }

  loadHembrasElegibles(): void {
    this.loading.set(true);
    const codFinca = this.selectedFinca() || undefined;

    this.reproduccionService.getHembrasParaDiagnostico(codFinca, 100).subscribe({
      next: (response) => {
        const responseData = response.data || { hembras: [], diasEspera: 30, pagination: {} };
        const hembrasData = responseData.hembras || [];
        if (responseData.diasEspera !== undefined) {
          this.diasEsperaDiagnostico.set(responseData.diasEspera);
        }
        const hembras = hembrasData.map((h: TemporadaMontaHembra) => this.procesarHembra(h));
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
    const codFinca = this.selectedFinca() || undefined;

    this.reproduccionService.getHembrasPendientesDiagnostico(codFinca, 100).subscribe({
      next: (response) => {
        const responseData = response.data || { hembras: [], diasEspera: 30, pagination: {} };
        const hembrasData = responseData.hembras || [];
        if (responseData.diasEspera !== undefined) {
          this.diasEsperaDiagnostico.set(responseData.diasEspera);
        }
        const hembras = hembrasData.map((h: TemporadaMontaHembra) => this.procesarHembra(h));
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
    const fechaFin = (hembra as any).temporada_monta?.fecha_fin 
      ? new Date((hembra as any).temporada_monta.fecha_fin) 
      : null;
    
    let diasDesdeFinMonta = 0;
    let diasRestantes = 0;
    const diasEspera = this.diasEsperaDiagnostico();
    
    if (fechaFin) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaFinNorm = new Date(fechaFin);
      fechaFinNorm.setHours(0, 0, 0, 0);
      
      diasDesdeFinMonta = Math.floor((hoy.getTime() - fechaFinNorm.getTime()) / (1000 * 60 * 60 * 24));
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
        this.reproduccionService.registrarDiagnosticoPrenez({
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

        this.reproduccionService.registrarDiagnosticoMasivo(diagnosticos).subscribe({
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
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
