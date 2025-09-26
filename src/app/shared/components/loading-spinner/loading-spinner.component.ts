import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <lucide-icon 
      [img]="spinnerIcon" 
      [size]="size" 
      [class]="spinnerClasses">
    </lucide-icon>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .spinner-animate {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: number = 16;
  @Input() color: string = 'text-primary';
  @Input() animate: boolean = true;
  
  spinnerIcon = Loader2;
  
  get spinnerClasses(): string {
    const baseClasses = [this.color];
    if (this.animate) {
      baseClasses.push('spinner-animate');
    }
    return baseClasses.join(' ');
  }
}
