import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FarmContextService } from '@core/services/farm-context.service';
import { environment } from '../../../../../environments/environment';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { LucideAngularModule, Activity, Baby, Heart, Milk, Scissors, Calendar, TrendingUp, AlertTriangle } from 'lucide-angular';

interface DashboardData {
  temporadas: { total: number; activas: number; finalizadas: number; canceladas: number };
  prenez: { totalDiagnosticadas: number; prenadas: number; vacias: number; abortos: number; tasaPrenez: number };
  partos: { totalPartos: number; totalCrias: number; criasVivas: number; criasMuertas: number; prolificidad: number; mortalidadNeonatal: number };
  lactancia: { enCalostro: number; lactando: number; destetados: number };
  crias: { totalCrias: number; sinTatuar: number; tatuadas: number };
  proximos_eventos: { tipo: string; fecha: string; animal: string }[];
}

@Component({
  selector: 'app-dashboard-reproduccion',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, TooltipModule, ProgressBarModule, LucideAngularModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold text-gray-800 mb-1">Dashboard Reproductivo</h2>
      <p class="text-gray-500 mb-6">KPIs consolidados del módulo de reproducción</p>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
        </div>
      } @else if (data()) {
        <!-- KPI Cards Row 1: Temporadas y Preñez -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl shadow-sm border p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <lucide-icon [img]="calendarIcon" size="20" class="text-blue-600"></lucide-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Temporadas</p>
                <p class="text-2xl font-bold text-gray-800">{{ data()!.temporadas.total }}</p>
              </div>
            </div>
            <div class="flex gap-2 text-xs">
              <p-tag value="Activas: {{ data()!.temporadas.activas }}" severity="success" />
              <p-tag value="Finalizadas: {{ data()!.temporadas.finalizadas }}" severity="info" />
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <lucide-icon [img]="heartIcon" size="20" class="text-green-600"></lucide-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Tasa de Preñez</p>
                <p class="text-2xl font-bold text-green-700">{{ data()!.prenez.tasaPrenez }}%</p>
              </div>
            </div>
            <p-progressbar [value]="data()!.prenez.tasaPrenez" [showValue]="false" styleClass="h-2" />
            <p class="text-xs text-gray-500 mt-2">{{ data()!.prenez.prenadas }} preñadas / {{ data()!.prenez.totalDiagnosticadas }} diagnosticadas</p>
          </div>

          <div class="bg-white rounded-xl shadow-sm border p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <lucide-icon [img]="trendingIcon" size="20" class="text-purple-600"></lucide-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Prolificidad</p>
                <p class="text-2xl font-bold text-purple-700">{{ data()!.partos.prolificidad }}</p>
              </div>
            </div>
            <p class="text-xs text-gray-500">crías/parto promedio</p>
          </div>

          <div class="bg-white rounded-xl shadow-sm border p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg" [ngClass]="data()!.partos.mortalidadNeonatal > 10 ? 'bg-red-100' : 'bg-emerald-100'">
                <lucide-icon [img]="alertIcon" size="20" [ngClass]="data()!.partos.mortalidadNeonatal > 10 ? 'text-red-600' : 'text-emerald-600'"></lucide-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Mortalidad Neonatal</p>
                <p class="text-2xl font-bold" [ngClass]="data()!.partos.mortalidadNeonatal > 10 ? 'text-red-700' : 'text-emerald-700'">{{ data()!.partos.mortalidadNeonatal }}%</p>
              </div>
            </div>
            <p class="text-xs text-gray-500">{{ data()!.partos.criasMuertas }} muertas / {{ data()!.partos.totalCrias }} total</p>
          </div>
        </div>

        <!-- KPI Cards Row 2: Partos, Lactancia, Crías -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl shadow-sm border p-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <lucide-icon [img]="babyIcon" size="20" class="text-pink-600"></lucide-icon>
              </div>
              <h3 class="font-semibold text-gray-800">Partos</h3>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm"><span class="text-gray-500">Total partos</span><span class="font-semibold">{{ data()!.partos.totalPartos }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-500">Crías vivas</span><span class="font-semibold text-green-600">{{ data()!.partos.criasVivas }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-500">Crías muertas</span><span class="font-semibold text-red-600">{{ data()!.partos.criasMuertas }}</span></div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border p-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <lucide-icon [img]="milkIcon" size="20" class="text-cyan-600"></lucide-icon>
              </div>
              <h3 class="font-semibold text-gray-800">Lactancia</h3>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm"><span class="text-gray-500">En calostro</span><span class="font-semibold text-amber-600">{{ data()!.lactancia.enCalostro }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-500">Lactando</span><span class="font-semibold text-blue-600">{{ data()!.lactancia.lactando }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-500">Destetados</span><span class="font-semibold text-green-600">{{ data()!.lactancia.destetados }}</span></div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border p-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <lucide-icon [img]="scissorsIcon" size="20" class="text-orange-600"></lucide-icon>
              </div>
              <h3 class="font-semibold text-gray-800">Crías</h3>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm"><span class="text-gray-500">Total</span><span class="font-semibold">{{ data()!.crias.totalCrias }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-500">Sin tatuar</span><span class="font-semibold text-amber-600">{{ data()!.crias.sinTatuar }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-500">Tatuadas</span><span class="font-semibold text-green-600">{{ data()!.crias.tatuadas }}</span></div>
            </div>
          </div>
        </div>

        <!-- Próximos Eventos -->
        @if (data()!.proximos_eventos.length > 0) {
          <div class="bg-white rounded-xl shadow-sm border p-5">
            <h3 class="font-semibold text-gray-800 mb-4">Próximos Eventos</h3>
            <div class="space-y-3">
              @for (evento of data()!.proximos_eventos; track evento.fecha + evento.animal) {
                <div class="flex items-center gap-3 p-3 rounded-lg" [ngClass]="evento.tipo === 'PARTO_PROXIMO' ? 'bg-pink-50' : 'bg-cyan-50'">
                  <p-tag
                    [value]="evento.tipo === 'PARTO_PROXIMO' ? 'Parto' : 'Destete'"
                    [severity]="evento.tipo === 'PARTO_PROXIMO' ? 'warn' : 'info'" />
                  <span class="text-sm font-medium">{{ evento.animal || 'N/A' }}</span>
                  <span class="text-sm text-gray-500 ml-auto">{{ evento.fecha }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Preñez Detalle -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-white rounded-xl shadow-sm border p-5">
            <h3 class="font-semibold text-gray-800 mb-4">Resultado Diagnósticos</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="text-sm flex-1">Preñadas</span>
                <span class="font-semibold">{{ data()!.prenez.prenadas }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-gray-400"></div>
                <span class="text-sm flex-1">Vacías</span>
                <span class="font-semibold">{{ data()!.prenez.vacias }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <span class="text-sm flex-1">Abortos</span>
                <span class="font-semibold">{{ data()!.prenez.abortos }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border p-5">
            <h3 class="font-semibold text-gray-800 mb-4">Temporadas por Estado</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="text-sm flex-1">Activas</span>
                <span class="font-semibold">{{ data()!.temporadas.activas }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <span class="text-sm flex-1">Finalizadas</span>
                <span class="font-semibold">{{ data()!.temporadas.finalizadas }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-gray-400"></div>
                <span class="text-sm flex-1">Canceladas</span>
                <span class="font-semibold">{{ data()!.temporadas.canceladas }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardReproduccionComponent implements OnInit {
  private http = inject(HttpClient);
  private farmContext = inject(FarmContextService);
  private destroyRef = inject(DestroyRef);
  private apiUrl = `${environment.apiUrl}/api/v1`;

  readonly calendarIcon = Calendar;
  readonly heartIcon = Heart;
  readonly trendingIcon = TrendingUp;
  readonly alertIcon = AlertTriangle;
  readonly babyIcon = Baby;
  readonly milkIcon = Milk;
  readonly scissorsIcon = Scissors;
  readonly activityIcon = Activity;

  data = signal<DashboardData | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    const farmId = this.farmContext.getSelectedFarm();
    if (!farmId) return;
    this.loading.set(true);
    this.http.get<{data: DashboardData}>(`${this.apiUrl}/reproduccion/dashboard?cod_finca=${farmId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => { this.data.set(res.data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }
}
