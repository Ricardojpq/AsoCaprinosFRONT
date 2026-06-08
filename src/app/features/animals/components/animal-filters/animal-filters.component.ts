import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { LucideAngularModule, Filter, X } from 'lucide-angular';
import { CatalogOptions, SelectOption } from '../../models/interfaces/catalog-options.interface';
import { AnimalFilters } from '../../models/interfaces/animal-filters.interface';

@Component({
  selector: 'app-animal-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, InputNumberModule, ButtonModule, PanelModule, LucideAngularModule],
  template: `
    <p-panel header="Filtros Avanzados" [toggleable]="true" [collapsed]="true" styleClass="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
        <!-- Sexo -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-600 mb-1">Sexo</label>
          <p-select
            [options]="sexOptions"
            [(ngModel)]="filters.sexo_animal"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos"
            [showClear]="true"
            class="w-full"
          />
        </div>

        <!-- Raza -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-600 mb-1">Raza</label>
          <p-select
            [options]="catalogs()?.breeds || []"
            [(ngModel)]="filters.cod_raza"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas"
            [showClear]="true"
            [filter]="true"
            class="w-full"
          />
        </div>

        <!-- Corral -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-600 mb-1">Corral</label>
          <p-select
            [options]="catalogs()?.corrales || []"
            [(ngModel)]="filters.cod_corral"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos"
            [showClear]="true"
            [filter]="true"
            class="w-full"
          />
        </div>

        <!-- Reproductor -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-600 mb-1">Reproductor</label>
          <p-select
            [options]="reproductorOptions"
            [(ngModel)]="filters.reproductor"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos"
            [showClear]="true"
            class="w-full"
          />
        </div>

        <!-- Peso Min -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-600 mb-1">Peso Min (kg)</label>
          <p-inputnumber
            [(ngModel)]="filters.peso_min"
            mode="decimal"
            [minFractionDigits]="1"
            [min]="0"
            placeholder="0"
            class="w-full"
          />
        </div>

        <!-- Peso Max -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-600 mb-1">Peso Max (kg)</label>
          <p-inputnumber
            [(ngModel)]="filters.peso_max"
            mode="decimal"
            [minFractionDigits]="1"
            [min]="0"
            placeholder="Sin límite"
            class="w-full"
          />
        </div>

        <!-- Edad Min (días) -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-600 mb-1">Edad Min (días)</label>
          <p-inputnumber
            [(ngModel)]="filters.edad_min_dias"
            [min]="0"
            placeholder="0"
            class="w-full"
          />
        </div>

        <!-- Edad Max (días) -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-600 mb-1">Edad Max (días)</label>
          <p-inputnumber
            [(ngModel)]="filters.edad_max_dias"
            [min]="0"
            placeholder="Sin límite"
            class="w-full"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t mt-3">
        <p-button label="Limpiar" [text]="true" size="small" (onClick)="clearFilters()">
          <lucide-icon [img]="xIcon" size="14" class="mr-1"></lucide-icon>
        </p-button>
        <p-button label="Aplicar" size="small" (onClick)="applyFilters()">
          <lucide-icon [img]="filterIcon" size="14" class="mr-1"></lucide-icon>
        </p-button>
      </div>
    </p-panel>
  `,
})
export class AnimalFiltersComponent {
  readonly filterIcon = Filter;
  readonly xIcon = X;

  readonly catalogs = input<CatalogOptions | null>(null);
  readonly onApplyFilters = output<Partial<AnimalFilters>>();

  sexOptions = [
    { label: 'Macho', value: 'M' },
    { label: 'Hembra', value: 'H' },
  ];
  reproductorOptions = [
    { label: 'Sí', value: 'S' },
    { label: 'No', value: 'N' },
  ];

  filters: Partial<AnimalFilters> = {};

  applyFilters(): void {
    const clean: any = {};
    Object.entries(this.filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') clean[k] = v;
    });
    this.onApplyFilters.emit(clean);
  }

  clearFilters(): void {
    this.filters = {};
    this.onApplyFilters.emit({});
  }
}
