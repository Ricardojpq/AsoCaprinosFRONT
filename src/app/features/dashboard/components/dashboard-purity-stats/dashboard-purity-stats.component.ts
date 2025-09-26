import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressBarModule } from 'primeng/progressbar';
import { LucideAngularModule, Dna, Star, TrendingUp } from 'lucide-angular';
import { PurityStats } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-purity-stats',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    SkeletonModule,
    ProgressBarModule,
    LucideAngularModule
  ],
  template: `
    <div class="h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-600 p-4 border-b border-slate-200 dark:border-gray-600">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
            <lucide-icon [img]="dnaIcon" size="20" class="text-white"></lucide-icon>
          </div>
          <span class="font-semibold text-lg text-gray-900 dark:text-white">Pureza de Sangre</span>
        </div>
      </div>
      
      <div class="p-6 space-y-6" *ngIf="!loading; else loadingTemplate">
        <!-- Chart -->
        <div class="flex justify-center mb-6">
          <div class="relative">
            <p-chart 
              type="polarArea" 
              [data]="chartData" 
              [options]="chartOptions"
              width="320"
              height="320">
            </p-chart>
            <!-- Custom HTML Legend -->
            <div class="mt-4">
              <div class="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div *ngFor="let stat of purityStats; let i = index" 
                     class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                     (click)="toggleDataVisibility(i)">
                  <div class="w-3 h-3 rounded-sm flex-shrink-0" [style.background-color]="stat.color"></div>
                  <span class="font-semibold text-gray-900 dark:text-white truncate">{{ stat.label }}</span>
                  <span class="text-amber-600 dark:text-amber-400 font-bold ml-auto">({{ stat.percentage }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Purity Breakdown -->
        <div class="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border border-slate-200 dark:border-gray-600">
          <div class="flex items-center gap-2 mb-4">
            <div class="p-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded">
              <lucide-icon [img]="starIcon" size="16" class="text-white"></lucide-icon>
            </div>
            <span class="font-semibold text-gray-900 dark:text-white">Distribución de Pureza</span>
          </div>
          
          <div class="space-y-4">
            <div *ngFor="let purity of purityStats" class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div 
                    class="w-4 h-4 rounded"
                    [style.background-color]="purity.color">
                  </div>
                  <span class="font-medium text-gray-900 dark:text-white text-sm">{{ purity.label }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-600 dark:text-gray-300 text-sm">{{ purity.count }}</span>
                  <span class="font-bold text-amber-600 dark:text-amber-400">{{ purity.percentage }}%</span>
                </div>
              </div>
              <div class="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  [style.background-color]="purity.color"
                  [style.width.%]="purity.percentage">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quality Metrics -->
        <div class="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border border-slate-200 dark:border-gray-600">
          <div class="flex items-center justify-between mb-3">
            <span class="font-semibold text-gray-900 dark:text-white">Índice de Calidad Genética</span>
            <lucide-icon [img]="trendingUpIcon" size="16" class="text-green-600 dark:text-green-400"></lucide-icon>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <div class="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-3">
                <div 
                  class="h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  [style.width.%]="qualityIndex">
                </div>
              </div>
            </div>
            <span class="font-bold text-2xl text-amber-600 dark:text-amber-400">{{ qualityIndex }}%</span>
          </div>
          <div class="text-gray-600 dark:text-gray-300 text-sm mt-2">
            Basado en la distribución de pureza de sangre
          </div>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 text-center border border-slate-200 dark:border-gray-600">
            <div class="text-gray-600 dark:text-gray-300 text-sm mb-1">Categorías</div>
            <div class="text-gray-900 dark:text-white font-bold text-2xl">{{ totalCategories }}</div>
          </div>
          <div class="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 text-center border border-slate-200 dark:border-gray-600">
            <div class="text-gray-600 dark:text-gray-300 text-sm mb-1">Más Común</div>
            <div class="text-gray-900 dark:text-white font-bold text-sm truncate">{{ topPurity?.label || 'N/A' }}</div>
          </div>
        </div>
      </div>
      
      <ng-template #loadingTemplate>
        <div class="p-6 space-y-6">
          <div class="flex justify-center">
            <p-skeleton width="320px" height="320px" shape="circle"></p-skeleton>
          </div>
          <p-skeleton width="100%" height="250px" borderRadius="8px"></p-skeleton>
          <p-skeleton width="100%" height="100px" borderRadius="8px"></p-skeleton>
          <div class="grid grid-cols-2 gap-4">
            <p-skeleton width="100%" height="80px" borderRadius="8px"></p-skeleton>
            <p-skeleton width="100%" height="80px" borderRadius="8px"></p-skeleton>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    
    .surface-card {
      transition: all 0.3s ease;
    }
    
    .surface-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 25px rgba(0,0,0,0.1) !important;
    }
    
    ::ng-deep .custom-progress .p-progressbar-value {
      display: none;
    }
    
    ::ng-deep .custom-quality-progress .p-progressbar-value {
      background: linear-gradient(90deg, #D4A574 0%, #B8860B 50%, #8B6914 100%);
    }
    
    @media (prefers-color-scheme: dark) {
      .surface-card:hover {
        box-shadow: 0 4px 25px rgba(255,255,255,0.1) !important;
      }
    }
  `]
})
export class DashboardPurityStatsComponent implements OnInit {
  @Input() purityStats: PurityStats[] = [];
  @Input() loading = false;

  dnaIcon = Dna;
  starIcon = Star;
  trendingUpIcon = TrendingUp;

  chartData: any;
  chartOptions: any;
  chartInstance: any;
  qualityIndex = 0;
  totalCategories = 0;
  topPurity: PurityStats | null = null;

  ngOnInit() {
    this.setupChart();
    this.calculateMetrics();
    this.setupThemeListener();
  }

  ngOnChanges() {
    this.setupChart();
    this.calculateMetrics();
  }

  private setupThemeListener() {
    // Escuchar cambios de tema para actualizar colores del gráfico
    const observer = new MutationObserver(() => {
      this.setupChart();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  private setupChart() {
    if (!this.purityStats.length) return;

    this.chartData = {
      labels: this.purityStats.map(stat => stat.label),
      datasets: [
        {
          data: this.purityStats.map(stat => stat.count),
          backgroundColor: this.purityStats.map(stat => stat.color + '80'),
          borderColor: this.purityStats.map(stat => stat.color),
          borderWidth: 2,
          hoverBackgroundColor: this.purityStats.map(stat => stat.color + 'CC'),
          hoverBorderColor: this.purityStats.map(stat => stat.color),
          hoverBorderWidth: 3
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Deshabilitamos la leyenda nativa para usar nuestra leyenda HTML personalizada
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#D4A574',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => {
              const stat = this.purityStats[context.dataIndex];
              return `${stat.label}: ${stat.count} animales (${stat.percentage}%)`;
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary') || '#6c757d'
          },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--surface-border') || '#dee2e6'
          }
        }
      },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      }
    };
  }

  private calculateMetrics() {
    this.totalCategories = this.purityStats.length;
    this.topPurity = this.purityStats.length > 0 ? this.purityStats[0] : null;
    
    // Calculate quality index based on purity distribution
    // Higher percentages of PO, PCOC, PR get higher scores
    let qualityScore = 0;
    const totalAnimals = this.purityStats.reduce((sum, stat) => sum + stat.count, 0);
    
    if (totalAnimals > 0) {
      this.purityStats.forEach(stat => {
        let weight = 1;
        const label = stat.label.toLowerCase();
        
        if (label.includes('puro original') || label.includes('po')) weight = 5;
        else if (label.includes('pcoc') || label.includes('cruzamiento')) weight = 4;
        else if (label.includes('puro por registro') || label.includes('pr')) weight = 4;
        else if (label.includes('base')) weight = 2;
        else if (label.includes('generación')) weight = 3;
        
        qualityScore += (stat.count / totalAnimals) * weight * 20;
      });
    }
    
    this.qualityIndex = Math.min(Math.round(qualityScore), 100);
  }

  toggleDataVisibility(index: number) {
    // Esta funcionalidad se puede implementar más adelante si se necesita interactividad
    // Por ahora, solo mostramos la leyenda estática
    console.log('Toggle visibility for index:', index);
  }
}
