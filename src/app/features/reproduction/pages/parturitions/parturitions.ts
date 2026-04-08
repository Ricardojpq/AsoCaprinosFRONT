import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FarmContextService } from '@core/services/farm-context.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReproductionService } from '../../services/reproduction.service';
import { Parto, CreatePartoRequest } from '../../models';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToolbarModule } from 'primeng/toolbar';
import { StepsModule } from 'primeng/steps';
import { BadgeModule } from 'primeng/badge';
import { LucideAngularModule, Plus, Search, Eye, Pencil, Trash2, X, UserCheck, CheckCircle, AlertTriangle, Inbox } from 'lucide-angular';

@Component({
  selector: 'app-partos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    TagModule,
    CardModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    TooltipModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    ToolbarModule,
    StepsModule,
    BadgeModule,
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './parturitions.html'
})
export class Partos implements OnInit {
  private reproductionService = inject(ReproductionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private farmContext = inject(FarmContextService);

  // Lucide icons
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly eyeIcon = Eye;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;
  readonly xIcon = X;
  readonly userCheckIcon = UserCheck;
  readonly checkCircleIcon = CheckCircle;
  readonly alertTriangleIcon = AlertTriangle;
  readonly inboxIcon = Inbox;

  partos = signal<Parto[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  showCreateDialog = signal(false);
  showDetailDialog = signal(false);
  showEditDialog = signal(false);
  selectedParto = signal<Parto | null>(null);
  editParto: any = {};
  
  // Filtros - usando finca del contexto global
  fechaInicio = signal<Date | null>(null);
  fechaFin = signal<Date | null>(null);

  // Hembras preñadas
  hembrasPregnadas = signal<any[]>([]);
  loadingHembrasPregnadas = signal(false);

  // Modal de registro de parto - Paso a paso
  currentStep = signal(0);
  showSelectResponsableDialog = signal(false);
  showSelectHembraDialog = signal(false);
  
  // Personas/Responsables
  personas = signal<any[]>([]);
  loadingPersonas = signal(false);
  personaSearchTerm = '';
  selectedResponsable = signal<any | null>(null);

  // Hembras para el parto
  hembrasParaParto = signal<any[]>([]);
  loadingHembrasParaParto = signal(false);
  femaleSearchTerm = '';
  
  // Detalles del parto en proceso
  detallesPartoTemp = signal<any[]>([]);
  currentHembraDetalle = signal<any | null>(null);
  showDetalleHembraDialog = signal(false);

  // Edición de detalles existentes
  editingDetalle = signal<any | null>(null);
  showEditDetalleDialog = signal(false);

  // Edición de crías
  editingCria = signal<any | null>(null);
  showEditCriaDialog = signal(false);

  // Opciones para crías
  sexoOptions = [
    { label: 'Macho', value: 'M' },
    { label: 'Hembra', value: 'H' }
  ];

  estadoNacimientoOptions = [
    { label: 'Vivo', value: 'VIVO' },
    { label: 'Muerto', value: 'MUERTO' },
    { label: 'Débil', value: 'DEBIL' }
  ];

  // Opciones
  tiposPartoOptions = [
    { label: 'Natural', value: 'NATURAL' },
    { label: 'Asistido', value: 'ASISTIDO' },
    { label: 'Cesárea', value: 'CESAREA' }
  ];

  estadosMadreOptions = [
    { label: 'Normal', value: 'NORMAL' },
    { label: 'Complicaciones', value: 'COMPLICACIONES' },
    { label: 'Fallecida', value: 'FALLECIDA' }
  ];

  newParto: CreatePartoRequest = {
    cod_finca: 0,
    fecha: new Date().toISOString().split('T')[0],
    detalles: []
  };

  // Computed para resumen
  resumenDetalles = computed(() => {
    const detalles = this.detallesPartoTemp();
    let totalCrias = 0;
    let criasVivas = 0;
    let criasMuertas = 0;
    detalles.forEach((d: any) => {
      totalCrias += d.numero_crias || 0;
      criasVivas += d.crias_vivas || 0;
      criasMuertas += d.crias_muertas || 0;
    });
    return { totalHembras: detalles.length, totalCrias, criasVivas, criasMuertas };
  });

  ngOnInit(): void {
    this.loadBirths();
    this.loadPregnantFemales();
  }

  get selectedFarm(): number | null {
    return this.farmContext.getSelectedFarm();
  }

  loadBirths(): void {
    this.loading.set(true);
    const filters: any = {};
    // Usar finca del contexto global
    const fincaId = this.farmContext.getSelectedFarm();
    if (fincaId) {
      filters.cod_finca = fincaId;
    }
    if (this.fechaInicio()) {
      filters.fecha_inicio = this.formatDate(this.fechaInicio()!);
    }
    if (this.fechaFin()) {
      filters.fecha_fin = this.formatDate(this.fechaFin()!);
    }

    this.reproductionService.getBirths(filters).subscribe({
      next: (response) => {
        this.partos.set(response.data.data);
        this.totalRecords.set(response.data.total);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar partos'
        });
        this.loading.set(false);
      }
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  clearFilters(): void {
    this.fechaInicio.set(null);
    this.fechaFin.set(null);
    this.loadBirths();
  }

  getBirthTypeLabel(tipo: string): string {
    const tipos: Record<string, string> = {
      'NATURAL': 'Natural',
      'ASISTIDO': 'Asistido',
      'CESAREA': 'Cesárea'
    };
    return tipos[tipo] || tipo;
  }

  getMotherStatusSeverity(estado: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'NORMAL': return 'success';
      case 'COMPLICACIONES': return 'warn';
      case 'FALLECIDA': return 'danger';
      default: return 'info';
    }
  }

  openDetailsDialog(parto: Parto): void {
    this.selectedParto.set(parto);
    this.showDetailDialog.set(true);
  }

  getResumenParto(): { totalCrias: number; criasVivas: number; criasMuertas: number; hembras: number } {
    const parto = this.selectedParto();
    if (!parto || !parto.detalles) {
      return { totalCrias: 0, criasVivas: 0, criasMuertas: 0, hembras: 0 };
    }
    
    let totalCrias = 0;
    let criasVivas = 0;
    let criasMuertas = 0;
    
    parto.detalles.forEach((detalle: any) => {
      totalCrias += detalle.numero_crias || 0;
      criasVivas += detalle.crias_vivas || 0;
      criasMuertas += detalle.crias_muertas || 0;
    });
    
    return {
      totalCrias,
      criasVivas,
      criasMuertas,
      hembras: parto.detalles.length
    };
  }

  openEditDialog(parto: Parto): void {
    this.selectedParto.set(parto);
    this.editParto = {
      id: parto.id,
      fecha: parto.fecha,
      comments: parto.comments || ''
    };
    this.showEditDialog.set(true);
  }

  updateBirthLocal(): void {
    if (!this.editParto.fecha) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La fecha es requerida'
      });
      return;
    }

    this.reproductionService.updateBirth(this.editParto.id, {
      fecha: this.editParto.fecha,
      comments: this.editParto.comments
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Parto actualizado exitosamente'
        });
        this.showEditDialog.set(false);
        this.loadBirths();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al actualizar parto'
        });
      }
    });
  }

  // =====================================================
  // EDICIÓN DE DETALLES EXISTENTES
  // =====================================================

  openEditDetalleDialog(detalle: any): void {
    this.editingDetalle.set({
      id: detalle.id,
      hembra: detalle.hembra,
      tipo_parto: detalle.tipo_parto || 'NATURAL',
      estado_madre_post_parto: detalle.estado_madre_post_parto || 'NORMAL',
      comments: detalle.comments || ''
    });
    this.showEditDetalleDialog.set(true);
  }

  updateDetalle(): void {
    const detalle = this.editingDetalle();
    if (!detalle) return;

    this.reproductionService.updateBirthDetail(detalle.id, {
      tipo_parto: detalle.tipo_parto,
      estado_madre_post_parto: detalle.estado_madre_post_parto,
      comments: detalle.comments
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Detalle actualizado exitosamente'
        });
        this.showEditDetalleDialog.set(false);
        this.editingDetalle.set(null);
        // Recargar el parto para ver los cambios
        this.loadBirths();
        // Si el modal de detalle está abierto, actualizar
        if (this.selectedParto()) {
          this.refreshSelectedParto();
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al actualizar detalle'
        });
      }
    });
  }

  refreshSelectedParto(): void {
    const partoId = this.selectedParto()?.id;
    if (!partoId) return;

    this.reproductionService.getBirth(partoId).subscribe({
      next: (response) => {
        this.selectedParto.set(response.data);
      }
    });
  }

  cancelEditDetalle(): void {
    this.showEditDetalleDialog.set(false);
    this.editingDetalle.set(null);
  }

  // =====================================================
  // EDICIÓN DE CRÍAS
  // =====================================================

  openEditCriaDialog(cria: any): void {
    this.editingCria.set({
      id: cria.id,
      codigo_provisional: cria.codigo_provisional,
      sexo: cria.sexo || 'M',
      peso_nacimiento: cria.peso_nacimiento,
      estado_nacimiento: cria.estado_nacimiento || 'VIVO',
      comments: cria.comments || ''
    });
    this.showEditCriaDialog.set(true);
  }

  updateOffspringLocal(): void {
    const cria = this.editingCria();
    if (!cria) return;

    this.reproductionService.updateOffspring(cria.id, {
      sexo: cria.sexo,
      peso_nacimiento: cria.peso_nacimiento,
      estado_nacimiento: cria.estado_nacimiento,
      comments: cria.comments
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cría actualizada exitosamente'
        });
        this.showEditCriaDialog.set(false);
        this.editingCria.set(null);
        this.loadBirths();
        if (this.selectedParto()) {
          this.refreshSelectedParto();
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al actualizar cría'
        });
      }
    });
  }

  cancelEditCria(): void {
    this.showEditCriaDialog.set(false);
    this.editingCria.set(null);
  }

  getSexLabel(sexo: string): string {
    return sexo === 'M' ? 'Macho' : sexo === 'H' ? 'Hembra' : '-';
  }

  getBirthStatusSeverity(estado: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast' | undefined {
    switch (estado) {
      case 'VIVO': return 'success';
      case 'MUERTO': return 'danger';
      case 'DEBIL': return 'warn';
      default: return 'secondary';
    }
  }

  // =====================================================
  // HEMBRAS PREÑADAS
  // =====================================================

  loadPregnantFemales(): void {
    const codFinca = this.selectedFarm;
    if (!codFinca) return;

    this.loadingHembrasPregnadas.set(true);
    this.reproductionService.getPregnantFemales(codFinca).subscribe({
      next: (response) => {
        this.hembrasPregnadas.set(response.data || []);
        this.loadingHembrasPregnadas.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar hembras preñadas'
        });
        this.loadingHembrasPregnadas.set(false);
      }
    });
  }

  getDiasPartoSeverity(dias: number): 'success' | 'warn' | 'danger' | 'info' {
    if (dias < 0) return 'danger'; // Pasada la fecha
    if (dias <= 7) return 'warn';  // Próxima semana
    if (dias <= 15) return 'info'; // Próximas 2 semanas
    return 'success';
  }

  // =====================================================
  // MODAL DE REGISTRO DE PARTO MEJORADO
  // =====================================================

  openCreateDialog(): void {
    this.newParto = {
      cod_finca: this.selectedFarm || 0,
      fecha: new Date().toISOString().split('T')[0],
      detalles: []
    };
    this.selectedResponsable.set(null);
    this.detallesPartoTemp.set([]);
    this.currentStep.set(0);
    this.loadPersons();
    this.loadFemalesForBirth();
    this.showCreateDialog.set(true);
  }

  // =====================================================
  // SELECCIÓN DE RESPONSABLE
  // =====================================================

  loadPersons(): void {
    this.loadingPersonas.set(true);
    this.reproductionService.getPersons().subscribe({
      next: (response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          this.personas.set(data);
        } else if (data && 'data' in data) {
          this.personas.set((data as any).data);
        }
        this.loadingPersonas.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar personas'
        });
        this.loadingPersonas.set(false);
      }
    });
  }

  openSelectResponsableDialog(): void {
    this.personaSearchTerm = '';
    this.showSelectResponsableDialog.set(true);
  }

  get filteredPersonas(): any[] {
    const personas = this.personas();
    if (!this.personaSearchTerm) return personas;
    const term = this.personaSearchTerm.toLowerCase();
    return personas.filter(p => 
      p.ced_persona?.toLowerCase().includes(term) ||
      p.nom_persona?.toLowerCase().includes(term) ||
      p.ape_persona?.toLowerCase().includes(term)
    );
  }

  selectResponsable(persona: any): void {
    this.selectedResponsable.set(persona);
    this.newParto.responsable_id = persona.ced_persona;
    this.showSelectResponsableDialog.set(false);
  }

  clearResponsable(): void {
    this.selectedResponsable.set(null);
    this.newParto.responsable_id = undefined;
  }

  // =====================================================
  // SELECCIÓN DE HEMBRAS PARA PARTO
  // =====================================================

  loadFemalesForBirth(): void {
    const codFinca = this.selectedFarm;
    if (!codFinca) return;

    this.loadingHembrasParaParto.set(true);
    this.reproductionService.getPregnantFemales(codFinca).subscribe({
      next: (response) => {
        this.hembrasParaParto.set(response.data || []);
        this.loadingHembrasParaParto.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar hembras para parto'
        });
        this.loadingHembrasParaParto.set(false);
      }
    });
  }

  openSelectHembraDialog(): void {
    this.femaleSearchTerm = '';
    this.showSelectHembraDialog.set(true);
  }

  get filteredHembrasParaParto(): any[] {
    const hembras = this.hembrasParaParto();
    // Filtrar las que ya están agregadas
    const idsAgregados = this.detallesPartoTemp().map((d: any) => d.hembra_id);
    const hembrasDisponibles = hembras.filter(h => !idsAgregados.includes(h.hembra?.id));
    
    if (!this.femaleSearchTerm) return hembrasDisponibles;
    const term = this.femaleSearchTerm.toLowerCase();
    return hembrasDisponibles.filter(h => 
      h.hembra?.nomb_animal?.toLowerCase().includes(term) ||
      h.hembra?.cod_animal?.toLowerCase().includes(term)
    );
  }

  selectHembraParaParto(hembraData: any): void {
    this.currentHembraDetalle.set({
      hembra_id: hembraData.hembra?.id,
      temporada_monta_hembra_id: hembraData.id,
      hembra: hembraData.hembra,
      tipo_parto: 'NATURAL',
      numero_crias: 1,
      crias_vivas: 1,
      crias_muertas: 0,
      estado_madre_post_parto: 'NORMAL',
      comments: ''
    });
    this.showSelectHembraDialog.set(false);
    this.showDetalleHembraDialog.set(true);
  }

  // =====================================================
  // DETALLE DE HEMBRA EN PARTO
  // =====================================================

  saveFemaleDetail(): void {
    const detalle = this.currentHembraDetalle();
    if (!detalle) return;

    // Validar
    if (detalle.numero_crias < 1) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El número de crías debe ser al menos 1'
      });
      return;
    }

    if ((detalle.crias_vivas || 0) + (detalle.crias_muertas || 0) !== detalle.numero_crias) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La suma de crías vivas y muertas debe ser igual al número total de crías'
      });
      return;
    }

    // Agregar a la lista temporal
    this.detallesPartoTemp.update(detalles => [...detalles, detalle]);
    this.showDetalleHembraDialog.set(false);
    this.currentHembraDetalle.set(null);
  }

  cancelFemaleDetail(): void {
    this.showDetalleHembraDialog.set(false);
    this.currentHembraDetalle.set(null);
  }

  removeDetailTemp(index: number): void {
    this.detallesPartoTemp.update(detalles => detalles.filter((_, i) => i !== index));
  }

  // =====================================================
  // REGISTRO FINAL DEL PARTO
  // =====================================================

  canRegisterBirth(): boolean {
    return this.detallesPartoTemp().length > 0 && !!this.newParto.fecha;
  }

  registerBirth(): void {
    if (!this.canRegisterBirth()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe agregar al menos una hembra y seleccionar la fecha'
      });
      return;
    }

    // Preparar datos para enviar
    const partoData: CreatePartoRequest = {
      cod_finca: this.newParto.cod_finca,
      fecha: this.newParto.fecha,
      responsable_id: this.newParto.responsable_id,
      comments: this.newParto.comments,
      detalles: this.detallesPartoTemp().map((d: any) => ({
        hembra_id: d.hembra_id,
        temporada_monta_hembra_id: d.temporada_monta_hembra_id,
        tipo_parto: d.tipo_parto,
        estado_madre_post_parto: d.estado_madre_post_parto,
        comments: d.comments,
        crias: this.generarCrias(d)
      }))
    };

    this.confirmationService.confirm({
      message: `¿Está seguro de registrar este parto con ${this.detallesPartoTemp().length} hembra(s)?`,
      header: 'Confirmar Registro',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reproductionService.createBirth(partoData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Parto registrado exitosamente'
            });
            this.showCreateDialog.set(false);
            this.loadBirths();
            this.loadPregnantFemales();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al registrar parto'
            });
          }
        });
      }
    });
  }

  private generarCrias(detalle: any): any[] {
    const crias: any[] = [];
    // Generar crías vivas
    for (let i = 0; i < (detalle.crias_vivas || 0); i++) {
      crias.push({
        sexo: 'H', // Por defecto, se puede cambiar después
        estado_nacimiento: 'VIVO'
      });
    }
    // Generar crías muertas
    for (let i = 0; i < (detalle.crias_muertas || 0); i++) {
      crias.push({
        sexo: 'H',
        estado_nacimiento: 'MUERTO'
      });
    }
    return crias;
  }
}
