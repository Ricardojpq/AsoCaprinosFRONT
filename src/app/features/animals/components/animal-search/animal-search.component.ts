import { Component, input, output, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideAngularModule, Search, X } from 'lucide-angular';

@Component({
  selector: 'app-animal-search',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    LucideAngularModule
  ],
  template: `
    <div class="flex items-center gap-2">
      <p-iconfield>
        <p-inputicon>
          <lucide-angular [img]="searchIcon" size="16"></lucide-angular>
        </p-inputicon>
        <input
          pInputText
          type="text"
          placeholder="Buscar animal..."
          [(ngModel)]="searchValue"
          (ngModelChange)="onSearchChange.emit($event)"
          class="focus:border-golden-500"
        />
        @if (searchValue) {
          <p-inputicon>
            <lucide-angular 
              [img]="xIcon" 
              size="16" 
              (click)="clearSearch()" 
              class="cursor-pointer"
            ></lucide-angular>
          </p-inputicon>
        }
      </p-iconfield>
    </div>
  `,
  styles: []
})
export class AnimalSearchComponent {
  readonly searchIcon = Search;
  readonly xIcon = X;
  
  readonly value = input<string>('');
  readonly onSearchChange = output<string>();
  readonly onClear = output<void>();

  searchValue = '';

  constructor() {
    effect(() => {
      this.searchValue = this.value();
    });
  }

  clearSearch(): void {
    this.searchValue = '';
    this.onSearchChange.emit('');
    this.onClear.emit();
  }
}
