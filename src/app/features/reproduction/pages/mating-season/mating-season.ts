import { Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FarmContextService } from '@core/services/farm-context.service';
import { SyncService } from '@core/services/sync.service';
import { ConflictError } from '@core/errors/app-errors';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReproductionService } from '../../services/reproduction.service';
import { TemporadaMonta, CreateBreedingSeasonRequest } from '../../models';
import { formatDateLocal } from '@core/utils/date-utils';

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
import { InputNumberModule } from 'primeng/inputnumber';
import { LucideAngularModule, Plus, Search, Check, X, Eye, UserPlus, ClipboardList } from 'lucide-angular';

@Component({
  selector: 'app-seasons-monta',
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
    InputNumberModule,
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './mating-season.html'
})
export class MatingSeason implements OnInit {
  private reproductionService = inject(ReproductionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private farmContext = inject(FarmContextService);
  private sync = inject(SyncService);
  private destroyRef = inject(DestroyRef);

  // Race-condition guards: switchMap cancela requests obsoletos cuando
  // el usuario dispara una segunda acción antes de que termine la primera.
  private detailsRequest$ = new Subject<number>();
  private resultRequest$ = new Subject<number>();

  // Flag para bloquear operaciones mientras otra está en vuelo.
  mutating = signal(false);

  // Timestamp de la última sincronización con el backend (para indicador UX).
  lastSync = signal<number | null>(null);

  // Lucide icons
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly eyeIcon = Eye;
  readonly userPlusIcon = UserPlus;
  readonly clipboardListIcon = ClipboardList;

  // Signals
  seasons = signal<TemporadaMonta[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  // Dialog states
  showCreateDialog = signal(false);
  showAddFemaleDialog = signal(false);
  showSelectMaleDialog = signal(false);
  showSelectFemaleDialog = signal(false);
  showDetailDialog = signal(false);
  showResultDialog = signal(false);
  showSearchFemaleDialog = signal(false);
  selectedSeason = signal<TemporadaMonta | null>(null);
  
  // Búsqueda de hembras
  searchFemaleTerm = '';
  femaleFound = signal<any | null>(null);
  loadingSearch = signal(false);

  // Form data
  newSeason: CreateBreedingSeasonRequest = {
    cod_finca: 0,
    macho_id: 0,
    fecha_inicio: '',
    modalidad_corral: 'HEMBRAS_AL_MACHO',
    corral_id: undefined
  };

  // Corrales disponibles para selección
  corrales = signal<any[]>([]);
  loadingCorrales = signal(false);
  
  // Corrales destino para finalizar/cancelar
  showEndSeasonDialog = signal(false);
  corralDestinoHembrasId: number | null = null;
  corralDestinoMachoId: number | null = null;

  // Filtro de raza para hembras
  filterRaza = signal<string | null>(null);
  razas = signal<any[]>([]);

  // Available animals
  maleSearchTerm = signal<any[]>([]);
  hembrasDisponibles = signal<any[]>([]);
  selectedFemales = signal<any[]>([]);
  selectedMacho = signal<any | null>(null);
  
  // Search filters for selection tables
  machoSearchTerm = '';
  femaleSearchTerm = '';
  
  // Loading states
  loadingMale = signal(false);
  loadingFemale = signal(false);

  // Filters - usando finca del contexto global
  filterSearch = signal<string>(''); // Busca por ID, nombre macho, código macho
  filterStartDate = signal<Date | null>(null);
  filterEndDate = signal<Date | null>(null);
  filterStatus = signal<string | null>(null);

  // Fecha mínima para datepicker (hoy, bloquea fechas pasadas)
  minDate = new Date();

  // Computed
  statusOptions = [
    { label: 'Todas', value: null },
    { label: 'Activa', value: 'ACTIVA' },
    { label: 'Finalizada', value: 'FINALIZADA' },
    { label: 'Cancelada', value: 'CANCELADA' }
  ];

  modalidadCorralOptions = [
    { label: 'Hembras al Macho', value: 'HEMBRAS_AL_MACHO' },
    { label: 'Todos a Corral Nuevo', value: 'TODOS_A_CORRAL_NUEVO' }
  ];

  ngOnInit(): void {
    this.loadSeasons();
    this.setupDialogRequestPipelines();
    this.setupAutoSync();
  }

  /**
   * Evita race conditions: si el usuario abre detalle, cierra y abre otro
   * rapidamente, switchMap cancela la petición anterior.
   */
  private setupDialogRequestPipelines(): void {
    this.detailsRequest$
      .pipe(
        switchMap(id => this.reproductionService.getMatingSeason(id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.selectedSeason.set(response.data);
          this.showDetailDialog.set(true);
        },
        error: () => {
          this.showDetailDialog.set(true);
        }
      });

    this.resultRequest$
      .pipe(
        switchMap(id => this.reproductionService.getMatingSeason(id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.selectedSeason.set(response.data);
          this.showResultDialog.set(true);
        },
        error: () => {
          this.showResultDialog.set(true);
        }
      });
  }

  /**
   * Auto-sync de temporadas: revalida cada 60s, al recuperar el foco
   * y al volver online. Previene mostrar stale data frente a automatizaciones
   * del backend que alteran el estado de hembras / temporadas.
   */
  private setupAutoSync(): void {
    this.sync
      .register({ intervalMs: 60_000, refreshOnFocus: true, refreshOnReconnect: true, immediate: false })
      .subscribe(() => {
        // Evitar pisar una edición en curso o diálogos abiertos de creación.
        if (this.mutating() || this.showCreateDialog() || this.showAddFemaleDialog()) return;
        this.loadSeasons(/* silent */ true);
      });
  }

  get selectedFarm(): number | null {
    return this.farmContext.getSelectedFarm();
  }

  applyFilters(): void {
    this.loadSeasons();
  }

  clearFilters(): void {
    this.filterSearch.set('');
    this.filterStartDate.set(null);
    this.filterEndDate.set(null);
    this.filterStatus.set(null);
    this.loadSeasons();
  }

  loadSeasons(silent = false): void {
    if (!silent) this.loading.set(true);
    const filters: any = {};
    // Usar finca del contexto global
    const farmId = this.farmContext.getSelectedFarm();
    if (farmId) {
      filters.cod_finca = farmId;
    }
    
    // Aplicar filtros de búsqueda
    if (this.filterSearch()) {
      filters.buscar = this.filterSearch();
    }
    if (this.filterStartDate()) {
      filters.fecha_inicio = formatDateLocal(this.filterStartDate()!);
    }
    if (this.filterEndDate()) {
      filters.fecha_fin = formatDateLocal(this.filterEndDate()!);
    }
    if (this.filterStatus()) {
      filters.estado = this.filterStatus();
    }

    this.reproductionService.getBreedingSeasons(filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const responseData = response.data || { data: [], total: 0 };
          this.seasons.set(responseData.data || []);
          this.totalRecords.set(responseData.total || 0);
          this.lastSync.set(Date.now());
          this.loading.set(false);
        },
        error: () => {
          // errorInterceptor ya muestra notificación; aquí sólo estado UI.
          this.loading.set(false);
        }
      });
  }

  /**
   * Helpers para mutaciones: bloquean UI (mutating signal) y detectan
   * ConflictError (409) para reconciliar datos automáticamente.
   */
  private handleMutationSuccess(detail: string): void {
    this.mutating.set(false);
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail });
    this.loadSeasons();
  }

  private handleMutationError(error: any, fallback: string): void {
    this.mutating.set(false);
    if (error instanceof ConflictError) {
      // Datos obsoletos: recargar para reconciliar con backend.
      this.loadSeasons();
      return;
    }
    // errorInterceptor ya muestra el toast; no duplicar.
    if (!error?.status) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: fallback });
    }
  }

  openCreateDialog(): void {
    this.newSeason = {
      cod_finca: this.selectedFarm || 0,
      macho_id: 0,
      fecha_inicio: formatDateLocal(new Date()),
      modalidad_corral: 'HEMBRAS_AL_MACHO',
      corral_id: undefined
    };
    this.selectedMacho.set(null);
    this.selectedFemales.set([]);
    this.femaleSearchTerm = '';
    this.filterRaza.set(null);
    
    // Cargar machos, hembras y corrales disponibles
    if (this.selectedFarm) {
      this.loadAvailableMales(this.selectedFarm);
      this.loadAvailableFemales(this.selectedFarm);
      this.loadCorrales(this.selectedFarm);
      this.loadRazas();
    }
    
    this.showCreateDialog.set(true);
  }

  // =====================================================
  // SELECCIÓN DE MACHO
  // =====================================================
  
  openSelectMaleDialog(): void {
    if (!this.selectedFarm) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione una finca desde el menú superior'
      });
      return;
    }
    this.machoSearchTerm = '';
    this.loadAvailableMales(this.selectedFarm);
    this.showSelectMaleDialog.set(true);
  }

  loadAvailableMales(codFinca: number): void {
    this.loadingMale.set(true);
    this.reproductionService.getBreedingMales(codFinca).subscribe({
      next: (response) => {
        this.maleSearchTerm.set(response.data);
        this.loadingMale.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar machos reproductores'
        });
        this.loadingMale.set(false);
      }
    });
  }

  selectMale(macho: any): void {
    this.selectedMacho.set(macho);
    this.newSeason.macho_id = macho.id;
    this.showSelectMaleDialog.set(false);
  }

  clearSelectedMale(): void {
    this.selectedMacho.set(null);
    this.newSeason.macho_id = 0;
  }

  get filteredMales(): any[] {
    const machos = this.maleSearchTerm();
    if (!this.machoSearchTerm) return machos;
    const term = this.machoSearchTerm.toLowerCase();
    return machos.filter(m => 
      m.nomb_animal?.toLowerCase().includes(term) ||
      m.cod_animal?.toLowerCase().includes(term)
    );
  }

  createSeason(): void {
    if (!this.newSeason.cod_finca || !this.newSeason.macho_id || !this.newSeason.fecha_inicio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    if (!this.newSeason.modalidad_corral) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione la modalidad de corral'
      });
      return;
    }

    if (this.selectedFemales().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos una hembra'
      });
      return;
    }

    // Incluir hembras en la creación
    const requestData = {
      ...this.newSeason,
      hembras_ids: this.selectedFemales().map(h => h.id)
    };

    this.reproductionService.createBreedingSeasons(requestData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Temporada de monta creada con ${this.selectedFemales().length} hembra(s)`
        });
        this.showCreateDialog.set(false);
        this.selectedMacho.set(null);
        this.selectedFemales.set([]);
        this.loadSeasons();
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

  openAddFemalesDialog(temporada: TemporadaMonta): void {
    this.selectedSeason.set(temporada);
    this.selectedFemales.set([]);
    this.femaleSearchTerm = '';
    this.loadAvailableFemales(temporada.cod_finca);
    this.showAddFemaleDialog.set(true);
  }

  loadAvailableFemales(codFinca: number): void {
    this.loadingFemale.set(true);
    this.reproductionService.getAvailableFemales(codFinca).subscribe({
      next: (response) => {
        let hembras = response.data || [];
        // Filtrar por raza si hay filtro activo
        if (this.filterRaza()) {
          hembras = hembras.filter((h: any) => h.cod_raza === this.filterRaza());
        }
        this.hembrasDisponibles.set(hembras);
        this.loadingFemale.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar hembras disponibles'
        });
        this.loadingFemale.set(false);
      }
    });
  }

  get filteredFemales(): any[] {
    const hembras = this.hembrasDisponibles();
    if (!this.femaleSearchTerm) return hembras;
    const term = this.femaleSearchTerm.toLowerCase();
    return hembras.filter(h => 
      h.nomb_animal?.toLowerCase().includes(term) ||
      h.cod_animal?.toLowerCase().includes(term)
    );
  }

  addFemales(): void {
    const temporada = this.selectedSeason();
    if (!temporada || this.selectedFemales().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione al menos una hembra'
      });
      return;
    }

    if (this.mutating()) return; // Anti-race: bloquear doble submit
    this.mutating.set(true);

    const femalesIds = this.selectedFemales().map(h => h.id);
    this.reproductionService.addFemalesToSeason(temporada.id, {
      hembras_ids: femalesIds
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showAddFemaleDialog.set(false);
          this.handleMutationSuccess('Hembras agregadas exitosamente');
        },
        error: (error) => this.handleMutationError(error, 'Error al agregar hembras')
      });
  }

  // =====================================================
  // VER DETALLE Y RESULTADO
  // =====================================================

  openDetailsDialog(temporada: TemporadaMonta): void {
    // Fallback inmediato con datos locales; switchMap cancelará si el usuario
    // abre otro diálogo antes de que llegue la respuesta.
    this.selectedSeason.set(temporada);
    this.detailsRequest$.next(temporada.id);
  }

  openResultDialog(temporada: TemporadaMonta): void {
    this.selectedSeason.set(temporada);
    this.resultRequest$.next(temporada.id);
  }

  getSummaryResults(): { prenadas: number; vacias: number; enMonta: number; total: number } {
    const season = this.selectedSeason();
    if (!season || !season.hembras) {
      return { prenadas: 0, vacias: 0, enMonta: 0, total: 0 };
    }
    const females = season.hembras;
    return {
      prenadas: females.filter(h => h.estado_reproduccion === 'PREÑADA').length,
      vacias: females.filter(h => h.estado_reproduccion === 'VACIA').length,
      enMonta: females.filter(h => h.estado_reproduccion === 'EN_MONTA').length,
      total: females.length
    };
  }

  endMatingSeason(temporada: TemporadaMonta): void {
    this.selectedSeason.set(temporada);
    this.corralDestinoHembrasId = null;
    this.corralDestinoMachoId = null;
    if (this.selectedFarm) {
      this.loadCorrales(this.selectedFarm);
    }
    this.showEndSeasonDialog.set(true);
  }

  confirmEndSeason(): void {
    const temporada = this.selectedSeason();
    if (!temporada) return;
    
    if (!this.corralDestinoHembrasId || !this.corralDestinoMachoId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar corral destino para hembras y macho'
      });
      return;
    }

    this.reproductionService.endMatingSeason(temporada.id, {
      corral_destino_hembras_id: this.corralDestinoHembrasId,
      corral_destino_macho_id: this.corralDestinoMachoId
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Temporada finalizada exitosamente'
        });
        this.showEndSeasonDialog.set(false);
        this.loadSeasons();
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

  cancelMatingSeason(temporada: TemporadaMonta): void {
    this.selectedSeason.set(temporada);
    this.corralDestinoHembrasId = null;
    this.corralDestinoMachoId = null;
    if (this.selectedFarm) {
      this.loadCorrales(this.selectedFarm);
    }
    this.showEndSeasonDialog.set(true);
  }

  confirmCancelSeason(): void {
    const temporada = this.selectedSeason();
    if (!temporada) return;
    
    if (!this.corralDestinoHembrasId || !this.corralDestinoMachoId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar corral destino para hembras y macho'
      });
      return;
    }

    this.reproductionService.cancelMatingSeason(temporada.id, {
      corral_destino_hembras_id: this.corralDestinoHembrasId,
      corral_destino_macho_id: this.corralDestinoMachoId
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Temporada cancelada exitosamente'
        });
        this.showEndSeasonDialog.set(false);
        this.loadSeasons();
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

  confirmPregnancy(hembra: any): void {
    this.reproductionService.confirmPregnancy(hembra.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Preñez confirmada exitosamente'
        });
        this.loadSeasons();
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

  markAsEmpty(hembra: any): void {
    this.reproductionService.markEmpty(hembra.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Hembra marcada como vacía'
        });
        this.loadSeasons();
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

  getStatusSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'ACTIVA': return 'success';
      case 'FINALIZADA': return 'info';
      case 'CANCELADA': return 'danger';
      default: return 'secondary';
    }
  }

  getReproductionStatusSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'EN_MONTA': return 'warn';
      case 'PREÑADA': return 'success';
      case 'VACIA': return 'secondary';
      case 'ABORTO': return 'danger';
      default: return 'info';
    }
  }

  toggleFemaleSelection(hembra: any): void {
    const current = this.selectedFemales();
    const index = current.findIndex(h => h.id === hembra.id);
    if (index >= 0) {
      this.selectedFemales.set(current.filter(h => h.id !== hembra.id));
    } else {
      this.selectedFemales.set([...current, hembra]);
    }
  }

  isFemaleSelected(hembraId: number): boolean {
    return this.selectedFemales().some(h => h.id === hembraId);
  }

  selectAllFemales(): void {
    this.selectedFemales.set([...this.filteredFemales]);
  }

  clearFemaleSelection(): void {
    this.selectedFemales.set([]);
  }

  calculateAge(fechaNacimiento: string): string {
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

  openSearchFemaleDialog(): void {
    this.searchFemaleTerm = '';
    this.femaleFound.set(null);
    this.showSearchFemaleDialog.set(true);
  }

  SearchFemale(): void {
    if (!this.searchFemaleTerm.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Ingrese un nombre o código para buscar'
      });
      return;
    }

    this.loadingSearch.set(true);
    const term = this.searchFemaleTerm.toLowerCase().trim();
    
    // Cargar TODAS las seasons activas (sin filtro de finca) para buscar
    this.reproductionService.getActiveMatingSeasons().subscribe({
      next: (response) => {
        const activeSeasons = response.data || [];
        let foundSeason: any = null;

        for (const season of activeSeasons) {
          if (season.hembras) {
            const female = season.hembras.find((h: any) => 
              h.hembra?.nomb_animal?.toLowerCase().includes(term) ||
              h.hembra?.cod_animal?.toLowerCase().includes(term)
            );
            if (female) {
              foundSeason = {
                hembra: female.hembra,
                season: season,
                macho: season.macho,
                fechaMonta: female.fecha_monta,
                estadoReproduction: female.estado_reproduccion
              };
              break;
            }
          }
        }

        this.femaleFound.set(foundSeason);
        this.loadingSearch.set(false);

        if (!foundSeason) {
          this.messageService.add({
            severity: 'info',
            summary: 'No encontrada',
            detail: 'La hembra no está asignada a ninguna temporada activa'
          });
        }
      },
      error: () => {
        this.loadingSearch.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al buscar hembra'
        });
      }
    });
  }

  // =====================================================
  // CORRALES Y RAZAS
  // =====================================================

  loadCorrales(codFinca: number): void {
    this.loadingCorrales.set(true);
    this.reproductionService.getCorrales(codFinca).subscribe({
      next: (response) => {
        this.corrales.set(response.data || []);
        this.loadingCorrales.set(false);
      },
      error: () => {
        this.loadingCorrales.set(false);
      }
    });
  }

  loadRazas(): void {
    this.reproductionService.getRazas().subscribe({
      next: (response) => {
        this.razas.set(response.data || []);
      }
    });
  }
}
