import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FarmContextService } from '@core/services/farm-context.service';
import { environment } from '../../../../../environments/environment';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LucideAngularModule, Check, RefreshCw, Sparkles } from 'lucide-angular';

interface CriaPendiente {
  id: number;
  codigo_provisional?: string;
  sexo: string;
  peso_nacimiento?: number;
  estado_nacimiento?: string;
  parto_detalle?: any;
  parto?: any;
  animal?: any;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Component({
  selector: 'app-tatuar-crias',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, ToastModule, ConfirmDialogModule,
    TagModule, TooltipModule, LucideAngularModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tattoo.html',
})
export class TatuarCriasComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private farmContext = inject(FarmContextService);
  private destroyRef = inject(DestroyRef);

  private apiUrl = `${environment.apiUrl}/api/v1`;

  readonly checkIcon = Check;
  readonly refreshIcon = RefreshCw;
  readonly sparklesIcon = Sparkles;

  crias = signal<CriaPendiente[]>([]);
  loading = signal(false);
  selectedCrias = signal<CriaPendiente[]>([]);
  showTattooDialog = signal(false);
  tattooingCria = signal<CriaPendiente | null>(null);
  codAnimal = '';

  ngOnInit(): void {
    this.loadCrias();
  }

  get selectedFarm(): number | null {
    return this.farmContext.getSelectedFarm();
  }

  loadCrias(): void {
    const farmId = this.selectedFarm;
    if (!farmId) { this.crias.set([]); return; }
    this.loading.set(true);
    this.http.get<ApiResponse<CriaPendiente[]>>(`${this.apiUrl}/reproduccion/crias/pendientes-tatuar?cod_finca=${farmId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => { this.crias.set(res.data || []); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  onSelectionChange(crias: any): void {
    this.selectedCrias.set(crias);
  }

  openTattooDialog(cria: CriaPendiente): void {
    this.tattooingCria.set(cria);
    this.codAnimal = '';
    this.showTattooDialog.set(true);
    this.fetchSugeridoCodAnimal();
  }

  fetchSugeridoCodAnimal(): void {
    const farmId = this.selectedFarm;
    if (!farmId) return;
    this.http.get<ApiResponse<{cod_animal: string}>>(`${this.apiUrl}/reproduccion/crias/siguiente-cod-animal?cod_finca=${farmId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => { if (!this.codAnimal) this.codAnimal = res.data?.cod_animal || ''; },
        error: () => {},
      });
  }

  tatuarCria(): void {
    const cria = this.tattooingCria();
    if (!cria || !this.codAnimal.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Ingrese el código del animal' });
      return;
    }

    this.http.post<ApiResponse<any>>(`${this.apiUrl}/reproduccion/crias/${cria.id}/tatuar`, {
      cod_animal: this.codAnimal.trim(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cría tatuada exitosamente' });
        this.showTattooDialog.set(false);
        this.loadCrias();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al tatuar' });
      },
    });
  }
}
