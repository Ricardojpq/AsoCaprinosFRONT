import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    @if (visible) {
      <div class="loading-overlay">
        <div class="loading-content">
          <img src="assets/logos/logo.png" alt="Logo" class="loading-logo" />
          <p-progress-spinner ariaLabel="Cargando" [style]="{width: '60px', height: '60px'}"></p-progress-spinner>
        </div>
      </div>
    }
  `,
  styleUrl: './loading.css'
})
export class AppLoading {
  @Input() visible = false;
} 