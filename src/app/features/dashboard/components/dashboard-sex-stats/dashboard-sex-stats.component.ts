import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { LucideAngularModule, Users, TrendingUp } from 'lucide-angular';
import { SexStats } from '../../services/dashboard-service';

@Component({
  selector: 'app-dashboard-sex-stats',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    SkeletonModule,
    LucideAngularModule
  ],
  template: `
    <div class="h-full bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 p-4 border-b border-slate-200 dark:border-slate-600">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
            <lucide-icon [img]="usersIcon" size="20" class="text-white"></lucide-icon>
          </div>
          <span class="font-semibold text-lg text-gray-900 dark:text-white">Distribución por Sexo</span>
      </div>
      
      @if (!loading) {
        <div class="p-6">
        <!-- Chart -->
        <div class="flex justify-center mb-6">
          <p-chart 
            type="doughnut" 
            [data]="chartData" 
            [options]="chartOptions"
            width="280"
            height="280">
          </p-chart>
        </div>
        
        <!-- Stats Cards -->
        <div class="space-y-4">
          @for (stat of sexStats; track $index) {
            <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center border-2"
                  [style.background-color]="stat.color + '20'"
                  [style.border-color]="stat.color">
                  <lucide-icon [img]="usersIcon" size="18" [style.color]="stat.color"></lucide-icon>
                </div>
                <div>
                  <div class="text-gray-900 dark:text-white font-medium text-lg">{{ stat.label }}</div>
                  <div class="text-gray-600 dark:text-gray-300 text-sm">{{ stat.count }} animales</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-gray-900 dark:text-white font-bold text-2xl">{{ stat.percentage }}%</div>
                <div class="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <lucide-icon [img]="trendingUpIcon" size="14"></lucide-icon>
                  <span class="text-sm font-medium">{{ stat.count }}</span>
                </div>
              </div>
            </div>
            </div>
          }
        </div>
        </div>
      } @else {
        <div class="p-6 space-y-6">
          <div class="flex justify-center">
            <p-skeleton width="280px" height="280px" shape="circle"></p-skeleton>
          </div>
          <div class="space-y-4">
            @for (i of [1,2]; track $index) {
              <p-skeleton width="100%" height="80px" borderRadius="8px"></p-skeleton>
            }
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
export class DashboardSexStatsComponent implements OnInit {
  @Input() sexStats: SexStats[] = [];
  @Input() loading = false;

  usersIcon = Users;
  trendingUpIcon = TrendingUp;

  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.setupChart();
  }

  ngOnChanges() {
    this.setupChart();
  }

  private setupChart() {
    if (!this.sexStats.length) return;

    this.chartData = {
      labels: this.sexStats.map(stat => stat.label),
      datasets: [
        {
          data: this.sexStats.map(stat => stat.count),
          backgroundColor: this.sexStats.map(stat => stat.color),
          borderColor: this.sexStats.map(stat => stat.color),
          borderWidth: 2,
          hoverBackgroundColor: this.sexStats.map(stat => stat.color + 'CC'),
          hoverBorderColor: this.sexStats.map(stat => stat.color),
          hoverBorderWidth: 3
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: '500'
            },
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#495057'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#D4A574',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => {
              const stat = this.sexStats[context.dataIndex];
              return `${stat.label}: ${stat.count} animales (${stat.percentage}%)`;
            }
          }
        }
      },
      cutout: '60%',
      animation: {
        animateRotate: true,
        duration: 1000
      }
    };
  }
}
