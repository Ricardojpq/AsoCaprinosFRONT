import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { BadgeModule } from 'primeng/badge';
import { LucideAngularModule, Heart, Award, TrendingUp } from 'lucide-angular';
import { BreedStats } from '../../services/dashboard-service';

@Component({
  selector: 'app-dashboard-breed-stats',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    SkeletonModule,
    BadgeModule,
    LucideAngularModule
  ],
  template: `
    <div class="h-full bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 p-4 border-b border-slate-200 dark:border-slate-600">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
            <lucide-icon [img]="heartIcon" size="20" class="text-white"></lucide-icon>
          </div>
          <span class="font-semibold text-lg text-gray-900 dark:text-white">Distribución por Raza</span>
        </div>
      </div>
      
      @if (!loading) {
        <div class="p-6 space-y-6">
        <!-- Chart -->
        <div class="flex justify-center">
          <p-chart 
            type="bar" 
            [data]="chartData" 
            [options]="chartOptions"
            width="400"
            height="300">
          </p-chart>
        </div>
        
        <!-- Top Breeds List -->
        <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div class="flex items-center gap-2 mb-4">
            <div class="p-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded">
              <lucide-icon [img]="awardIcon" size="16" class="text-white"></lucide-icon>
            </div>
            <span class="font-semibold text-gray-900 dark:text-white">Distribución De Animales Ror Razas</span>
          </div>
          
          <div class="space-y-3">
            @for (breed of topBreeds; track $index; let i = $index) {
              <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-600">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm text-white"
                     [style.background-color]="breed.color">
                  {{ i + 1 }}
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ breed.label }}</div>
                  <div class="text-gray-600 dark:text-gray-300 text-sm">{{ breed.count }} animales</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 rounded-full text-xs font-medium text-white"
                      [style.background-color]="breed.color">
                  {{ breed.percentage }}%
                </span>
                <lucide-icon [img]="trendingUpIcon" size="14" class="text-green-600 dark:text-green-400"></lucide-icon>
              </div>
              </div>
            }
          </div>
        </div>
        
        <!-- Summary Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center border border-slate-200 dark:border-slate-600">
            <div class="text-gray-600 dark:text-gray-300 text-sm mb-1">Nro de Razas</div>
            <div class="text-gray-900 dark:text-white font-bold text-2xl">{{ totalBreeds }}</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center border border-slate-200 dark:border-slate-600">
            <div class="text-gray-600 dark:text-gray-300 text-sm mb-1">Raza Principal</div>
            <div class="text-gray-900 dark:text-white font-bold text-lg truncate">{{ topBreed?.label || 'N/A' }}</div>
          </div>
        </div>
        </div>
      } @else {
        <div class="p-6 space-y-6">
          <div class="flex justify-center">
            <p-skeleton width="400px" height="300px" borderRadius="8px"></p-skeleton>
          </div>
          <p-skeleton width="100%" height="200px" borderRadius="8px"></p-skeleton>
          <div class="grid grid-cols-2 gap-4">
            <p-skeleton width="100%" height="80px" borderRadius="8px"></p-skeleton>
            <p-skeleton width="100%" height="80px" borderRadius="8px"></p-skeleton>
          </div>
        </div>
      }
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
    
    @media (prefers-color-scheme: dark) {
      .surface-card:hover {
        box-shadow: 0 4px 25px rgba(255,255,255,0.1) !important;
      }
    }
  `]
})
export class DashboardBreedStatsComponent implements OnInit {
  @Input() breedStats: BreedStats[] = [];
  @Input() loading = false;

  heartIcon = Heart;
  awardIcon = Award;
  trendingUpIcon = TrendingUp;

  chartData: any;
  chartOptions: any;
  topBreeds: BreedStats[] = [];
  totalBreeds = 0;
  topBreed: BreedStats | null = null;

  ngOnInit() {
    this.setupChart();
    this.calculateStats();
  }

  ngOnChanges() {
    this.setupChart();
    this.calculateStats();
  }

  private setupChart() {
    if (!this.breedStats.length) return;

    // Show top 8 breeds in chart
    const topBreedsForChart = this.breedStats.slice(0, 8);

    this.chartData = {
      labels: topBreedsForChart.map(stat => stat.label.length > 15 ? stat.label.substring(0, 15) + '...' : stat.label),
      datasets: [
        {
          label: 'Cantidad de Animales',
          data: topBreedsForChart.map(stat => stat.count),
          backgroundColor: topBreedsForChart.map(stat => stat.color + '80'),
          borderColor: topBreedsForChart.map(stat => stat.color),
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#D4A574',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => {
              const stat = topBreedsForChart[context.dataIndex];
              return `${stat.label}: ${stat.count} animales (${stat.percentage}%)`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary') || '#6c757d'
          },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--surface-border') || '#dee2e6'
          }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary') || '#6c757d',
            maxRotation: 45,
            minRotation: 0
          },
          grid: {
            display: false
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    };
  }

  private calculateStats() {
    this.topBreeds = this.breedStats.slice(0, 5);
    this.totalBreeds = this.breedStats.length;
    this.topBreed = this.breedStats.length > 0 ? this.breedStats[0] : null;
  }
}
