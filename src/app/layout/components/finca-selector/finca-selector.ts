import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { FarmContextService } from '@core/services/finca-context.service';
import { AuthService } from '@features/auth/services/auth.service';
import { LucideAngularModule, MapPin } from 'lucide-angular';

interface FincaOption {
  label: string;
  value: number | null;
}

@Component({
  selector: 'app-finca-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, ProgressSpinnerModule, SkeletonModule, LucideAngularModule],
  template: `
    @if (loading()) {
      <div class="flex items-center gap-2 px-3 py-2">
        <p-skeleton width="180px" height="38px" borderRadius="8px"></p-skeleton>
      </div>
    } @else if (fincaOptions().length > 1) {
      <div class="flex items-center gap-2">
        <p-select
          [options]="fincaOptions()"
          [ngModel]="selectedFincaId()"
          (ngModelChange)="onFincaChange($event)"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccionar finca"
          [style]="{ minWidth: '200px' }"
          class="finca-selector"
        ></p-select>
      </div>
    } @else if (fincaOptions().length === 1) {
      <div class="flex items-center gap-2 px-3 py-2 bg-golden-50 dark:bg-golden-900/20 rounded-lg border border-golden-200 dark:border-golden-700/30">
        <lucide-icon [img]="mapPinIcon" size="16" class="text-golden-600 dark:text-golden-400"></lucide-icon>
        <span class="text-sm font-medium text-golden-800 dark:text-golden-300">
          {{ fincaOptions()[0]?.label }}
        </span>
      </div>
    } @else {
      <div class="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700/30">
        <lucide-icon [img]="mapPinIcon" size="16" class="text-red-600 dark:text-red-400"></lucide-icon>
        <span class="text-sm font-medium text-red-800 dark:text-red-300">
          Sin fincas asignadas
        </span>
      </div>
    }
  `,
  styles: [`
    :host ::ng-deep .finca-selector {
      .p-select {
        background: var(--surface-ground);
        border-color: var(--surface-border);
      }
      .p-select-label {
        font-size: 0.875rem;
        font-weight: 500;
      }
    }
  `]
})
export class FincaSelectorComponent {
  readonly mapPinIcon = MapPin;
  private farmContext = inject(FarmContextService);
  private authService = inject(AuthService);

  loading = signal(true);
  fincaOptions = signal<FincaOption[]>([]);
  selectedFincaId = signal<number | null>(null);

  constructor() {
    // Efecto que se ejecuta cuando el usuario cambia (cuando /auth/me responde)
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.loadFincasFromUser(user);
      }
    });
  }

  private loadFincasFromUser(user: any): void {
    const fincas = user.fincas || [];
    
    // Crear opciones de fincas (sin opción "Todas" - todos deben seleccionar una finca específica)
    const options: FincaOption[] = fincas.map((f: any) => ({
      label: f.nomb_finca || f.nom_finca,
      value: f.cod_finca
    }));

    this.fincaOptions.set(options);

    // Cargar finca seleccionada del localStorage o usar la primera/principal
    const storedFinca = this.farmContext.getSelectedFarm();
    
    if (storedFinca && fincas.some((f: any) => f.cod_finca === storedFinca)) {
      this.selectedFincaId.set(storedFinca);
    } else if (fincas.length > 0) {
      // Buscar finca principal o usar la primera
      const principal = fincas.find((f: any) => f.es_principal || f.es_finca_principal);
      const defaultFinca = principal || fincas[0];
      this.selectedFincaId.set(defaultFinca.cod_finca);
      this.farmContext.setSelectedFarm(defaultFinca.cod_finca);
    }
    
    // Terminar carga
    this.loading.set(false);
  }

  onFincaChange(codFinca: number | null): void {
    this.selectedFincaId.set(codFinca);
    this.farmContext.setSelectedFarm(codFinca);
    // Recargar la página para aplicar el filtro
    window.location.reload();
  }
}
