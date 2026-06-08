import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-lang-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <button
      class="layout-topbar-action flex items-center justify-center w-10 h-10 rounded-lg
             hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors cursor-pointer
             text-sm font-semibold text-gray-600 dark:text-gray-300 select-none"
      [pTooltip]="current() === 'es' ? 'Switch to English' : 'Cambiar a Español'"
      tooltipPosition="bottom"
      (click)="toggle()"
    >
      {{ current() === 'es' ? 'EN' : 'ES' }}
    </button>
  `,
})
export class LangToggleComponent {
  private transloco = inject(TranslocoService);
  readonly current = signal<string>(this.transloco.getActiveLang());

  toggle(): void {
    const next = this.current() === 'es' ? 'en' : 'es';
    this.transloco.setActiveLang(next);
    this.current.set(next);
    localStorage.setItem('lang', next);
  }
}
