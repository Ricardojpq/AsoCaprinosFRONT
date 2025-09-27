import { Injectable, signal } from '@angular/core';
import { LayoutService } from '@layout/services/layout-service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor(private layoutService: LayoutService) {
  }

  private getInitialTheme(): boolean {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);;
  }


  getIsDarkMode() {
    return this.isDarkMode.asReadonly();
  }

  toggleTheme(): void {
    this.isDarkMode.set(!this.isDarkMode())
    this.updateTheme();
  }
  updateTheme() {
    const root = window.document.documentElement;
    if (this.isDarkMode()) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: this.isDarkMode() }));
  }
}
