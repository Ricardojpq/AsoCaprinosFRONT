import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { LucideAngularModule, BarChart3, RefreshCw, AlertCircle } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';

import { DashboardService, DashboardStats } from './services/dashboard.service';
import { DashboardSexStatsComponent } from './components/dashboard-sex-stats/dashboard-sex-stats.component';
import { DashboardBreedStatsComponent } from './components/dashboard-breed-stats/dashboard-breed-stats.component';
import { DashboardPurityStatsComponent } from './components/dashboard-purity-stats/dashboard-purity-stats.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule,
    MessageModule,
    ButtonModule,
    LucideAngularModule,
    DashboardSexStatsComponent,
    DashboardBreedStatsComponent,
    DashboardPurityStatsComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  dashboardStats: DashboardStats | null = null;
  loading = true;
  error: string | null = null;
  
  // Icons
  barChartIcon = BarChart3;
  refreshIcon = RefreshCw;
  alertIcon = AlertCircle;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;
    
    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.dashboardStats = stats;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.error = 'Error al cargar los datos del dashboard. Por favor, intente nuevamente.';
          this.loading = false;
        }
      });
  }

  refreshData() {
    this.loadDashboardData();
  }
}
