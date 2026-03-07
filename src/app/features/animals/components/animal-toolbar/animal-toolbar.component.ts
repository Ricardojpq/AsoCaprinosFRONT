import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-animal-toolbar',
  standalone: true,
  imports: [ButtonModule, LucideAngularModule],
  template: `
    <div class="flex gap-1">
      <p-button
        styleClass="btn btn-primary btn-sm"
        label="Nuevo Animal"
        (onClick)="onNew.emit()"
      >
        <lucide-icon [img]="plusIcon" size="16"></lucide-icon>
      </p-button>
    </div>
  `,
  styles: []
})
export class AnimalToolbarComponent {
  readonly plusIcon = Plus;
  readonly onNew = output<void>();
}
