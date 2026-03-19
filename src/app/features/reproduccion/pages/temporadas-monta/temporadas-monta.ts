import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReproduccionService } from '../../services/reproduccion.service';
import { TemporadaMonta, CreateTemporadaMontaRequest } from '../../models';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideAngularModule, Plus, Search, Check, X, Eye, UserPlus, ClipboardList } from 'lucide-angular';

@Component({
  selector: 'app-temporadas-monta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    CardModule,
    ProgressSpinnerModule,
    TooltipModule,
    CheckboxModule,
    TextareaModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './temporadas-monta.html'
})
export class TemporadasMonta implements OnInit {
  private reproduccionService = inject(ReproduccionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Lucide icons
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly eyeIcon = Eye;
  readonly userPlusIcon = UserPlus;
  readonly clipboardListIcon = ClipboardList;

  // Signals
  temporadas = signal<TemporadaMonta[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  // Dialog states
  showCreateDialog = signal(false);
  showAddHembrasDialog = signal(false);
  showSelectMachoDialog = signal(false);
  showSelectHembrasDialog = signal(false);
  showDetalleDialog = signal(false);
  showResultadoDialog = signal(false);
  showBuscarHembraDialog = signal(false);
  selectedTemporada = signal<TemporadaMonta | null>(null);
  
  // Búsqueda de hembras
  buscarHembraTerm = '';
  hembraEncontrada = signal<any | null>(null);
  loadingBusqueda = signal(false);

  // Form data
  newTemporada: CreateTemporadaMontaRequest = {
    cod_finca: 0,
    macho_id: 0,
    fecha_inicio: ''
  };

  // Available animals
  machosDisponibles = signal<any[]>([]);
  hembrasDisponibles = signal<any[]>([]);
  selectedHembras = signal<any[]>([]);
  selectedMacho = signal<any | null>(null);
  
  // Search filters for selection tables
  machoSearchTerm = '';
  hembraSearchTerm = '';
  
  // Loading states
  loadingMachos = signal(false);
  loadingHembras = signal(false);

  // Filters
  selectedFinca = signal<number | null>(null);
  fincas = signal<any[]>([]);

  // Computed
  estadoOptions = [
    { label: 'Todas', value: null },
    { label: 'Activa', value: 'ACTIVA' },
    { label: 'Finalizada', value: 'FINALIZADA' },
    { label: 'Cancelada', value: 'CANCELADA' }
  ];

  ngOnInit(): void {
    this.loadFincas();
    this.loadTemporadas();
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
          this.loadTemporadas();
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
    this.loadTemporadas();
    if (this.selectedFinca()) {
      this.loadMachosDisponibles(this.selectedFinca()!);
    }
  }

  loadTemporadas(): void {
    this.loading.set(true);
    const filters: any = {};
    if (this.selectedFinca()) {
      filters.cod_finca = this.selectedFinca();
    }

    this.reproduccionService.getTemporadasMonta(filters).subscribe({
      next: (response) => {
        const responseData = response.data || { data: [], pagination: { total: 0 } };
        this.temporadas.set(responseData.data || []);
        this.totalRecords.set(responseData.pagination?.total || 0);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar temporadas de monta'
        });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    this.newTemporada = {
      cod_finca: this.selectedFinca() || 0,
      macho_id: 0,
      fecha_inicio: new Date().toISOString().split('T')[0]
    };
    this.selectedMacho.set(null);
    this.selectedHembras.set([]);
    this.hembraSearchTerm = '';
    
    // Cargar machos y hembras disponibles
    if (this.selectedFinca()) {
      this.loadMachosDisponibles(this.selectedFinca()!);
      this.loadHembrasDisponibles(this.selectedFinca()!);
    }
    
    this.showCreateDialog.set(true);
  }

  // =====================================================
  // SELECCIÓN DE MACHO
  // =====================================================
  
  openSelectMachoDialog(): void {
    if (!this.selectedFinca()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione una finca primero'
      });
      return;
    }
    this.machoSearchTerm = '';
    this.loadMachosDisponibles(this.selectedFinca()!);
    this.showSelectMachoDialog.set(true);
  }

  loadMachosDisponibles(codFinca: number): void {
    this.loadingMachos.set(true);
    this.reproduccionService.getMachosReproductores(codFinca).subscribe({
      next: (response) => {
        this.machosDisponibles.set(response.data);
        this.loadingMachos.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar machos reproductores'
        });
        this.loadingMachos.set(false);
      }
    });
  }

  selectMacho(macho: any): void {
    this.selectedMacho.set(macho);
    this.newTemporada.macho_id = macho.id;
    this.showSelectMachoDialog.set(false);
  }

  clearSelectedMacho(): void {
    this.selectedMacho.set(null);
    this.newTemporada.macho_id = 0;
  }

  get filteredMachos(): any[] {
    const machos = this.machosDisponibles();
    if (!this.machoSearchTerm) return machos;
    const term = this.machoSearchTerm.toLowerCase();
    return machos.filter(m => 
      m.nombAnimal?.toLowerCase().includes(term) ||
      m.codAnimal?.toLowerCase().includes(term)
    );
  }

  createTemporada(): void {
    if (!this.newTemporada.cod_finca || !this.newTemporada.macho_id || !this.newTemporada.fecha_inicio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    if (this.selectedHembras().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos una hembra'
      });
      return;
    }

    // Incluir hembras en la creación
    const requestData = {
      ...this.newTemporada,
      hembras_ids: this.selectedHembras().map(h => h.id)
    };

    this.reproduccionService.createTemporadaMonta(requestData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Temporada de monta creada con ${this.selectedHembras().length} hembra(s)`
        });
        this.showCreateDialog.set(false);
        this.selectedMacho.set(null);
        this.selectedHembras.set([]);
        this.loadTemporadas();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al crear temporada de monta'
        });
      }
    });
  }

  // =====================================================
  // SELECCIÓN DE HEMBRAS
  // =====================================================

  openAddHembrasDialog(temporada: TemporadaMonta): void {
    this.selectedTemporada.set(temporada);
    this.selectedHembras.set([]);
    this.hembraSearchTerm = '';
    this.loadHembrasDisponibles(temporada.codFinca);
    this.showAddHembrasDialog.set(true);
  }

  loadHembrasDisponibles(codFinca: number): void {
    this.loadingHembras.set(true);
    this.reproduccionService.getHembrasDisponibles(codFinca).subscribe({
      next: (response) => {
        this.hembrasDisponibles.set(response.data);
        this.loadingHembras.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar hembras disponibles'
        });
        this.loadingHembras.set(false);
      }
    });
  }

  get filteredHembras(): any[] {
    const hembras = this.hembrasDisponibles();
    if (!this.hembraSearchTerm) return hembras;
    const term = this.hembraSearchTerm.toLowerCase();
    return hembras.filter(h => 
      h.nombAnimal?.toLowerCase().includes(term) ||
      h.codAnimal?.toLowerCase().includes(term)
    );
  }

  agregarHembras(): void {
    const temporada = this.selectedTemporada();
    if (!temporada || this.selectedHembras().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione al menos una hembra'
      });
      return;
    }

    const hembraIds = this.selectedHembras().map(h => h.id);
    this.reproduccionService.agregarHembrasATemporada(temporada.id, {
      hembras_ids: hembraIds
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Hembras agregadas exitosamente'
        });
        this.showAddHembrasDialog.set(false);
        this.loadTemporadas();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al agregar hembras'
        });
      }
    });
  }

  // =====================================================
  // VER DETALLE Y RESULTADO
  // =====================================================

  openDetalleDialog(temporada: TemporadaMonta): void {
    // Cargar la temporada completa desde el backend para asegurar que tenga todos los datos
    this.reproduccionService.getTemporadaMonta(temporada.id).subscribe({
      next: (response) => {
        this.selectedTemporada.set(response.data);
        this.showDetalleDialog.set(true);
      },
      error: () => {
        // Si falla, usar los datos que ya tenemos
        this.selectedTemporada.set(temporada);
        this.showDetalleDialog.set(true);
      }
    });
  }

  openResultadoDialog(temporada: TemporadaMonta): void {
    // Cargar la temporada completa desde el backend
    this.reproduccionService.getTemporadaMonta(temporada.id).subscribe({
      next: (response) => {
        this.selectedTemporada.set(response.data);
        this.showResultadoDialog.set(true);
      },
      error: () => {
        this.selectedTemporada.set(temporada);
        this.showResultadoDialog.set(true);
      }
    });
  }

  getResumenResultados(): { prenadas: number; vacias: number; enMonta: number; total: number } {
    const temporada = this.selectedTemporada();
    if (!temporada || !temporada.hembras) {
      return { prenadas: 0, vacias: 0, enMonta: 0, total: 0 };
    }
    const hembras = temporada.hembras;
    return {
      prenadas: hembras.filter(h => h.estadoReproduccion === 'PREÑADA').length,
      vacias: hembras.filter(h => h.estadoReproduccion === 'VACIA').length,
      enMonta: hembras.filter(h => h.estadoReproduccion === 'EN_MONTA').length,
      total: hembras.length
    };
  }

  finalizarTemporada(temporada: TemporadaMonta): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de finalizar esta temporada de monta?',
      header: 'Confirmar Finalización',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reproduccionService.finalizarTemporada(temporada.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Temporada finalizada exitosamente'
            });
            this.loadTemporadas();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al finalizar temporada'
            });
          }
        });
      }
    });
  }

  cancelarTemporada(temporada: TemporadaMonta): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de cancelar esta temporada de monta?',
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reproduccionService.cancelarTemporada(temporada.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Temporada cancelada exitosamente'
            });
            this.loadTemporadas();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al cancelar temporada'
            });
          }
        });
      }
    });
  }

  confirmarPrenez(hembra: any): void {
    this.reproduccionService.confirmarPrenez(hembra.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Preñez confirmada exitosamente'
        });
        this.loadTemporadas();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al confirmar preñez'
        });
      }
    });
  }

  marcarVacia(hembra: any): void {
    this.reproduccionService.marcarVacia(hembra.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Hembra marcada como vacía'
        });
        this.loadTemporadas();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al marcar como vacía'
        });
      }
    });
  }

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'ACTIVA': return 'success';
      case 'FINALIZADA': return 'info';
      case 'CANCELADA': return 'danger';
      default: return 'secondary';
    }
  }

  getEstadoReproduccionSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'EN_MONTA': return 'warn';
      case 'PREÑADA': return 'success';
      case 'VACIA': return 'secondary';
      case 'ABORTO': return 'danger';
      default: return 'info';
    }
  }

  toggleHembraSelection(hembra: any): void {
    const current = this.selectedHembras();
    const index = current.findIndex(h => h.id === hembra.id);
    if (index >= 0) {
      this.selectedHembras.set(current.filter(h => h.id !== hembra.id));
    } else {
      this.selectedHembras.set([...current, hembra]);
    }
  }

  isHembraSelected(hembraId: number): boolean {
    return this.selectedHembras().some(h => h.id === hembraId);
  }

  selectAllHembras(): void {
    this.selectedHembras.set([...this.filteredHembras]);
  }

  clearHembraSelection(): void {
    this.selectedHembras.set([]);
  }

  calcularEdad(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'N/A';
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    const diffTime = Math.abs(hoy.getTime() - nacimiento.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} días`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} años`;
  }

  // =====================================================
  // BÚSQUEDA DE HEMBRAS
  // =====================================================

  openBuscarHembraDialog(): void {
    this.buscarHembraTerm = '';
    this.hembraEncontrada.set(null);
    this.showBuscarHembraDialog.set(true);
  }

  buscarHembra(): void {
    if (!this.buscarHembraTerm.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Ingrese un nombre o código para buscar'
      });
      return;
    }

    this.loadingBusqueda.set(true);
    const term = this.buscarHembraTerm.toLowerCase().trim();
    
    // Cargar TODAS las temporadas activas (sin filtro de finca) para buscar
    this.reproduccionService.getTemporadasActivas().subscribe({
      next: (response) => {
        const temporadasActivas = response.data || [];
        let encontrada: any = null;

        for (const temporada of temporadasActivas) {
          if (temporada.hembras) {
            const hembra = temporada.hembras.find((h: any) => 
              h.hembra?.nombAnimal?.toLowerCase().includes(term) ||
              h.hembra?.codAnimal?.toLowerCase().includes(term)
            );
            if (hembra) {
              encontrada = {
                hembra: hembra.hembra,
                temporada: temporada,
                macho: temporada.macho,
                fechaMonta: hembra.fechaMonta,
                estadoReproduccion: hembra.estadoReproduccion
              };
              break;
            }
          }
        }

        this.hembraEncontrada.set(encontrada);
        this.loadingBusqueda.set(false);

        if (!encontrada) {
          this.messageService.add({
            severity: 'info',
            summary: 'No encontrada',
            detail: 'La hembra no está asignada a ninguna temporada activa'
          });
        }
      },
      error: () => {
        this.loadingBusqueda.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al buscar hembra'
        });
      }
    });
  }
}
