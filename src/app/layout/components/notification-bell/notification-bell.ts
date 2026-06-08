import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';
import { BadgeModule } from 'primeng/badge';
import { LucideAngularModule, Bell, AlertTriangle, Calendar, Scissors, Info } from 'lucide-angular';
import { ReproductiveAlertsService, ReproductiveAlert } from '@core/services/reproductive-alerts.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule, StyleClassModule, BadgeModule, LucideAngularModule],
  template: `
    <div class="relative">
      <!-- Bell button -->
      <button
        pStyleClass="@next"
        enterFromClass="hidden"
        enterActiveClass="animate-scalein"
        leaveActiveClass="animate-fadeout"
        leaveToClass="hidden"
        [hideOnOutsideClick]="true"
        class="relative layout-topbar-action flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
        (click)="alertsService.fetch()"
      >
        <lucide-icon [img]="bellIcon" size="20"></lucide-icon>
        @if (alertsService.totalCount() > 0) {
          <span class="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {{ alertsService.totalCount() > 99 ? '99+' : alertsService.totalCount() }}
          </span>
        }
      </button>

      <!-- Dropdown panel -->
      <div class="hidden absolute right-0 top-full mt-1 w-80 bg-surface-0 dark:bg-surface-900 rounded-xl shadow-xl border border-surface z-[999] overflow-hidden">
        <div class="px-4 py-3 border-b border-surface flex items-center justify-between">
          <span class="font-semibold text-sm">Alertas Reproductivas</span>
          @if (alertsService.totalCount() > 0) {
            <span class="text-xs text-red-500 font-medium">{{ alertsService.totalCount() }} pendiente{{ alertsService.totalCount() > 1 ? 's' : '' }}</span>
          }
        </div>

        @if (alertsService.alerts().length === 0) {
          <div class="px-4 py-6 text-center text-gray-500 text-sm">
            <lucide-icon [img]="bellIcon" size="24" class="mx-auto mb-2 opacity-40"></lucide-icon>
            <p>Sin alertas pendientes</p>
          </div>
        } @else {
          <ul class="max-h-80 overflow-y-auto">
            @for (alert of alertsService.alerts(); track alert.tipo) {
              <li>
                <a
                  [routerLink]="alert.ruta"
                  class="flex items-start gap-3 px-4 py-3 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer border-b border-surface/50 last:border-0"
                >
                  <div class="mt-0.5 flex-shrink-0" [ngClass]="{
                    'text-amber-500': alert.severity === 'warn',
                    'text-red-500': alert.severity === 'error',
                    'text-blue-500': alert.severity === 'info'
                  }">
                    <lucide-icon [img]="alert.severity === 'warn' ? alertIcon : infoIcon" size="16"></lucide-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ alert.mensaje }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ labelTipo(alert.tipo) }}</p>
                  </div>
                  <span class="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-full" [ngClass]="{
                    'bg-amber-100 text-amber-700': alert.severity === 'warn',
                    'bg-red-100 text-red-700': alert.severity === 'error',
                    'bg-blue-100 text-blue-700': alert.severity === 'info'
                  }">{{ alert.count }}</span>
                </a>
              </li>
            }
          </ul>
        }

        <div class="px-4 py-2 border-t border-surface">
          <a routerLink="/reproduccion/dashboard" class="text-xs text-blue-500 hover:underline">
            Ver dashboard reproductivo →
          </a>
        </div>
      </div>
    </div>
  `,
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  readonly alertsService = inject(ReproductiveAlertsService);
  readonly bellIcon = Bell;
  readonly alertIcon = AlertTriangle;
  readonly infoIcon = Info;

  ngOnInit(): void {
    this.alertsService.startPolling();
  }

  ngOnDestroy(): void {
    this.alertsService.stopPolling();
  }

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      PARTO_PROXIMO: 'Reproducción › Partos',
      DESTETE_PROXIMO: 'Reproducción › Lactancia',
      CRIAS_SIN_TATUAR: 'Reproducción › Tatuar crías',
      DX_PENDIENTE: 'Reproducción › Diagnóstico',
    };
    return map[tipo] ?? 'Reproducción';
  }
}
