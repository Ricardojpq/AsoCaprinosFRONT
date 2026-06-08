import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FarmContextService } from '@core/services/farm-context.service';
import { environment } from '../../../../../environments/environment';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LucideAngularModule, Plus, Search, Pencil, Trash2 } from 'lucide-angular';

interface Corral {
  id: number;
  cod_finca: number;
  nombre: string;
  descripcion?: string;
  capacidad?: number;
  is_active?: boolean;
  finca?: any;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Component({
  selector: 'app-corral-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ToolbarModule,
    TooltipModule,
    TextareaModule,
    LucideAngularModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 m-0">Corrales</h2>
          <p class="text-gray-600 mt-1">Gestión de corrales de la finca</p>
        </div>
        <p-button label="Nuevo Corral" icon="pi pi-plus" (onClick)="openCreateDialog()"></p-button>
      </div>

      <p-table
        [value]="corrales()"
        [loading]="loading()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20]"
        styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Capacidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-corral>
          <tr>
            <td>{{ corral.id }}</td>
            <td class="font-semibold">{{ corral.nombre }}</td>
            <td>{{ corral.descripcion || '-' }}</td>
            <td>{{ corral.capacidad || '-' }}</td>
            <td>
              <p-tag
                [value]="corral.is_active ? 'Activo' : 'Inactivo'"
                [severity]="corral.is_active ? 'success' : 'secondary'">
              </p-tag>
            </td>
            <td>
              <div class="flex gap-1">
                <p-button [rounded]="true" [text]="true" pTooltip="Editar" (onClick)="openEditDialog(corral)">
                  <lucide-icon [img]="pencilIcon" size="16"></lucide-icon>
                </p-button>
                <p-button [rounded]="true" [text]="true" severity="danger" pTooltip="Eliminar" (onClick)="confirmDelete(corral)">
                  <lucide-icon [img]="trashIcon" size="16"></lucide-icon>
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="text-center text-gray-500">No hay corrales registrados</td></tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Create/Edit Dialog -->
    <p-dialog
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{width: '500px'}"
      [header]="editingCorral() ? 'Editar Corral' : 'Nuevo Corral'"
      [closable]="true">
      <ng-template pTemplate="content">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Nombre *</label>
            <input type="text" pInputText [(ngModel)]="form.nombre" placeholder="Nombre del corral" class="w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <textarea pTextarea [(ngModel)]="form.descripcion" rows="2" placeholder="Descripción opcional" class="w-full"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Capacidad</label>
            <input type="number" pInputText [(ngModel)]="form.capacidad" placeholder="Número de animales" class="w-full">
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <p-button label="Cancelar" [text]="true" (onClick)="showDialog.set(false)"></p-button>
        <p-button label="Guardar" (onClick)="save()" [disabled]="!form.nombre.trim()"></p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class CorralManagement implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private farmContext = inject(FarmContextService);
  private destroyRef = inject(DestroyRef);

  private apiUrl = `${environment.apiUrl}/api/v1`;

  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;

  corrales = signal<Corral[]>([]);
  loading = signal(false);
  showDialog = signal(false);
  editingCorral = signal<Corral | null>(null);

  form = { nombre: '', descripcion: '', capacidad: undefined as number | undefined };

  ngOnInit(): void {
    this.loadCorrales();
  }

  get selectedFarm(): number | null {
    return this.farmContext.getSelectedFarm();
  }

  loadCorrales(): void {
    const farmId = this.selectedFarm;
    if (!farmId) {
      this.corrales.set([]);
      return;
    }
    this.loading.set(true);
    this.http.get<ApiResponse<Corral[]>>(`${this.apiUrl}/corrales?cod_finca=${farmId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.corrales.set(res.data || []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  openCreateDialog(): void {
    this.editingCorral.set(null);
    this.form = { nombre: '', descripcion: '', capacidad: undefined };
    this.showDialog.set(true);
  }

  openEditDialog(corral: Corral): void {
    this.editingCorral.set(corral);
    this.form = {
      nombre: corral.nombre,
      descripcion: corral.descripcion || '',
      capacidad: corral.capacidad,
    };
    this.showDialog.set(true);
  }

  save(): void {
    const farmId = this.selectedFarm;
    if (!farmId || !this.form.nombre.trim()) return;

    const body = {
      cod_finca: farmId,
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion.trim() || undefined,
      capacidad: this.form.capacidad || undefined,
    };

    const editing = this.editingCorral();
    const request = editing
      ? this.http.put<ApiResponse<Corral>>(`${this.apiUrl}/corrales/${editing.id}`, body)
      : this.http.post<ApiResponse<Corral>>(`${this.apiUrl}/corrales`, body);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: editing ? 'Corral actualizado' : 'Corral creado' });
        this.showDialog.set(false);
        this.loadCorrales();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al guardar' });
      },
    });
  }

  confirmDelete(corral: Corral): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el corral "${corral.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`${this.apiUrl}/corrales/${corral.id}`)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Corral eliminado' });
              this.loadCorrales();
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al eliminar' });
            },
          });
      },
    });
  }
}
