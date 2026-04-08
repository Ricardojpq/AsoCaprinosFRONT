import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';
import { AnimalDto } from '../../models/DTOs/animal';
import { LazyLoadEvent } from '../../models/interfaces/table-events.interface';

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    LucideAngularModule,
    DatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './animal-list.component.html',
  styleUrl: './animal-list.component.css'
})
export class AnimalListComponent {
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;

  // Inputs
  readonly animals = input.required<AnimalDto[]>();
  readonly loading = input<boolean>(false);
  readonly totalRecords = input<number>(0);
  readonly rows = input<number>(10);
  readonly sortField = input<string>('nomb_animal');
  readonly sortOrder = input<'asc' | 'desc'>('asc');

  // Outputs
  readonly onLazyLoad = output<LazyLoadEvent>();
  readonly onEdit = output<AnimalDto>();
  readonly onDelete = output<AnimalDto>();

  handleLazyLoad(event: any): void {
    this.onLazyLoad.emit(event);
  }

  editAnimal(animal: AnimalDto): void {
    this.onEdit.emit(animal);
  }

  deleteAnimal(animal: AnimalDto): void {
    this.onDelete.emit(animal);
  }

  getSeverity(status: string): 'success' | 'danger' | 'info' {
    switch (status) {
      case 'A':
        return 'success';
      case 'I':
        return 'danger';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: string): string {
    return status === 'A' ? 'Activo' : 'Inactivo';
  }

  getOriginLabel(origen: string): string {
    const labels: Record<string, string> = {
      'N': 'Nacido',
      'I': 'Importado',
      'C': 'Comprado'
    };
    return labels[origen] || origen;
  }

  getConceptionTypeLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'M': 'Monta Natural',
      'I': 'Inseminación',
      'F': 'TE Fresco',
      'C': 'TE Congelado'
    };
    return labels[tipo] || tipo;
  }

  getBirthTypeLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'S': 'Simple',
      'M': 'Múltiple',
      'T': 'Triple'
    };
    return labels[tipo] || tipo;
  }
}
