import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ThemeService } from '@core/services/theme-service';
import { LucideAngularModule,Sun, Moon } from 'lucide-angular';

@Component({
  selector: 'app-theme-toggle',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css'
})
export class ThemeToggle {
  isDarkMode;
  SunIcon = Sun;
  MoonIcon = Moon;
  
  constructor(private themeService:ThemeService){
    this.isDarkMode = this.themeService.getIsDarkMode();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
