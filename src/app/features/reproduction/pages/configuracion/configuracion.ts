import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReproductionService } from '../../services/reproduction.service';
import { Parametro } from '../../models';

import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideAngularModule, Plus, Search, X, Pencil, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    TextareaModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './configuracion.html'
})
export class Configuracion implements OnInit {
  private reproductionService = inject(ReproductionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  @ViewChild('dt') dt!: Table;

  // Lucide icons
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly xIcon = X;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;

  // Signals
  parametros = signal<Parametro[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  globalFilterValue = '';

  // Pagination
  perPage = 25;
  currentPage = 1;
  sortField = 'nombre';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Dialog states
  showDialog = signal(false);
  isEditing = signal(false);
  selectedParametro = signal<Parametro | null>(null);

  // Form data
  formData = signal<Partial<Parametro>>({
    nombre: '',
    descripcion: '',
    valor: '',
    tipo_dato: 'string',
    categoria: ''
  });

  
  ngOnInit(): void {
    this.loadParametros();
  }

  loadParametros(): void {
    this.loading.set(true);

    const filters: any = {
      page: this.currentPage,
      per_page: this.perPage,
      sort_by: this.sortField,
      sort_dir: this.sortOrder
    };

    if (this.globalFilterValue) {
      filters.search = this.globalFilterValue;
    }

    this.reproductionService.getParametros(filters).subscribe({
      next: (response) => {
        this.parametros.set(response.data.data);
        this.totalRecords.set(response.data.total);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar parámetros'
        });
        this.loading.set(false);
      }
    });
  }

  onTableLazyLoad(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.perPage = event.rows;

    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    }

    this.loadParametros();
  }

  openCreateDialog(): void {
    this.isEditing.set(false);
    this.selectedParametro.set(null);
    this.formData.set({
      nombre: '',
      descripcion: '',
      valor: '',
      tipo_dato: 'string',
      categoria: 'REPRODUCCION'
    });
    this.showDialog.set(true);
  }

  openEditDialog(parametro: Parametro): void {
    this.isEditing.set(true);
    this.selectedParametro.set(parametro);
    this.formData.set({
      nombre: parametro.nombre,
      descripcion: parametro.descripcion,
      valor: parametro.valor,
      tipo_dato: parametro.tipo_dato,
      categoria: parametro.categoria
    });
    this.showDialog.set(true);
  }

  saveParametro(): void {
    const data = this.formData();
    
    if (!data.nombre || !data.valor) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Nombre y valor son requeridos'
      });
      return;
    }

    if (this.isEditing() && this.selectedParametro()) {
      // Actualizar
      this.reproductionService.updateParametro(this.selectedParametro()!.id, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Parámetro actualizado correctamente'
          });
          this.showDialog.set(false);
          this.loadParametros();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al actualizar parámetro'
          });
        }
      });
    } else {
      // Crear
      this.reproductionService.createParametro(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Parámetro creado correctamente'
          });
          this.showDialog.set(false);
          this.loadParametros();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al crear parámetro'
          });
        }
      });
    }
  }

  deleteParametro(parametro: Parametro): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el parámetro "${parametro.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.reproductionService.deleteParametro(parametro.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Parámetro eliminado correctamente'
            });
            this.loadParametros();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al eliminar parámetro'
            });
          }
        });
      }
    });
  }

  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.globalFilterValue = value;
    this.currentPage = 1;
    this.loadParametros();
  }

  clearSearch(): void {
    this.globalFilterValue = '';
    this.currentPage = 1;
    this.loadParametros();
  }

  updateFormField(field: string, value: any): void {
    this.formData.update(current => ({
      ...current,
      [field]: value
    }));
  }
}
