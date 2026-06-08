import { Component, input, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { LucideAngularModule, Download, RefreshCw } from 'lucide-angular';
import { environment } from '../../../../../environments/environment';

export interface PedigreeNode {
  cod_finca?: number;
  cod_animal?: number | string;
  nomb_animal?: string;
  sexo?: string;
  fec_nacim?: string;
  nomb_raza?: string;
  cod_padre?: number | string;
  cod_finca_padre?: number;
  cod_madre?: number | string;
  cod_finca_madre?: number;
  padre?: PedigreeNode;
  madre?: PedigreeNode;
}

@Component({
  selector: 'app-animal-pedigree',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule, LucideAngularModule],
  template: `
    <div class="pedigree-container">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Árbol Genealógico (Pedigree)</h3>
        <p-button [text]="true" size="small" pTooltip="Recargar" (onClick)="load()">
          <lucide-icon [img]="refreshIcon" size="16"></lucide-icon>
        </p-button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-8">
          <i class="pi pi-spin pi-spinner text-3xl text-blue-500"></i>
        </div>
      } @else if (root()) {
        <div class="overflow-x-auto">
          <div class="pedigree-tree min-w-[700px]" style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; align-items: center;">

            <!-- Columna 1: Animal principal -->
            <div class="flex flex-col items-center justify-center gap-4">
              <ng-container *ngTemplateOutlet="nodeCard; context: { node: root(), gen: 0 }"></ng-container>
            </div>

            <!-- Columna 2: Padre + Madre -->
            <div class="flex flex-col gap-4">
              <ng-container *ngTemplateOutlet="nodeCard; context: { node: root()?.padre, gen: 1, label: 'Padre' }"></ng-container>
              <ng-container *ngTemplateOutlet="nodeCard; context: { node: root()?.madre, gen: 1, label: 'Madre' }"></ng-container>
            </div>

            <!-- Columna 3: Abuelos -->
            <div class="flex flex-col gap-2">
              <ng-container *ngTemplateOutlet="nodeCard; context: { node: root()?.padre?.padre, gen: 2, label: 'Ab. Paterno ♂' }"></ng-container>
              <ng-container *ngTemplateOutlet="nodeCard; context: { node: root()?.padre?.madre, gen: 2, label: 'Ab. Paterna ♀' }"></ng-container>
              <ng-container *ngTemplateOutlet="nodeCard; context: { node: root()?.madre?.padre, gen: 2, label: 'Ab. Materno ♂' }"></ng-container>
              <ng-container *ngTemplateOutlet="nodeCard; context: { node: root()?.madre?.madre, gen: 2, label: 'Ab. Materna ♀' }"></ng-container>
            </div>
          </div>
        </div>
      }

      <!-- Node card template -->
      <ng-template #nodeCard let-node="node" let-gen="gen" let-label="label">
        @if (node) {
          <div
            class="pedigree-node rounded-lg border-2 p-3 text-center transition-shadow hover:shadow-md cursor-default"
            [ngClass]="nodeClass(node, gen)"
          >
            @if (label) {
              <div class="text-[10px] font-bold uppercase tracking-wide opacity-60 mb-1">{{ label }}</div>
            }
            <div class="font-semibold text-sm truncate max-w-[140px]" [title]="node.nomb_animal || '—'">
              {{ node.nomb_animal || ('Cód: ' + node.cod_animal) }}
            </div>
            @if (node.nomb_raza) {
              <div class="text-xs opacity-70 truncate">{{ node.nomb_raza }}</div>
            }
            @if (node.fec_nacim) {
              <div class="text-xs opacity-50 mt-1">{{ node.fec_nacim | date:'dd/MM/yyyy' }}</div>
            }
          </div>
        } @else {
          <div class="pedigree-node-empty rounded-lg border-2 border-dashed border-gray-200 p-3 text-center opacity-40">
            @if (label) {
              <div class="text-[10px] font-bold uppercase tracking-wide mb-1">{{ label }}</div>
            }
            <div class="text-xs text-gray-400">Sin registro</div>
          </div>
        }
      </ng-template>
    </div>
  `,
  styles: [`
    .pedigree-node {
      min-width: 120px;
    }
  `],
})
export class AnimalPedigreeComponent {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1`;

  readonly refreshIcon = RefreshCw;
  readonly downloadIcon = Download;

  readonly animalId = input<number | null>(null);
  readonly codFinca = input<number | null>(null);
  readonly codAnimal = input<string | null>(null);

  root = signal<PedigreeNode | null>(null);
  loading = signal(false);

  constructor() {
    effect(() => {
      const id = this.animalId();
      const finca = this.codFinca();
      const cod = this.codAnimal();
      if (id || (finca && cod)) {
        this.load();
      }
    });
  }

  load(): void {
    const id = this.animalId();
    const finca = this.codFinca();
    const cod = this.codAnimal();
    if (!id && !(finca && cod)) return;

    const url = id
      ? `${this.apiUrl}/animals/${id}/pedigree`
      : `${this.apiUrl}/animals/pedigree?cod_finca=${finca}&cod_animal=${cod}`;

    this.loading.set(true);
    this.http.get<{ data: PedigreeNode }>(url).subscribe({
      next: res => { this.root.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  nodeClass(node: PedigreeNode, gen: number): string {
    const sexo = node.sexo?.toUpperCase();
    if (gen === 0) return 'border-amber-400 bg-amber-50 dark:bg-amber-900/20';
    if (sexo === 'M') return 'border-blue-400 bg-blue-50 dark:bg-blue-900/20';
    if (sexo === 'H') return 'border-pink-400 bg-pink-50 dark:bg-pink-900/20';
    return 'border-gray-300 bg-gray-50 dark:bg-gray-800/20';
  }
}
