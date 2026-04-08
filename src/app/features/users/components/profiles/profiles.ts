import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode, MessageService, ConfirmationService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { LucideAngularModule, Plus, Pencil, Trash2, Shield, X, Check, Save } from 'lucide-angular';
import { PerfilesService, Perfil, Modulo, PerfilModulo, ModuloPermiso } from '../../services/perfiles.service';

interface ModuloPermisoUI extends ModuloPermiso {
  modulo?: Modulo;
  nombre?: string;
  nivel?: number;
}

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    TreeTableModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
    LucideAngularModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './profiles.html',
  styleUrl: './profiles.css'
})
export class Profiles implements OnInit {
  private perfilesService = inject(PerfilesService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Iconos Lucide
  readonly plusIcon = Plus;
  readonly pencilIcon = Pencil;
  readonly trash2Icon = Trash2;
  readonly shieldIcon = Shield;
  readonly xIcon = X;
  readonly checkIcon = Check;
  readonly saveIcon = Save;

  // Estado
  perfiles = signal<Perfil[]>([]);
  modulosFlat = signal<Modulo[]>([]);
  loading = signal(true);
  loadingPermisos = signal(false);

  // Paginación
  totalRecords = signal(0);
  rows = 10;
  first = 0;

  // Diálogo de crear/editar perfil
  showPerfilDialog = signal(false);
  editingPerfil = signal<Perfil | null>(null);
  perfilNombre = signal('');
  savingPerfil = signal(false);

  // Diálogo de permisos
  showPermisosDialog = signal(false);
  selectedPerfil = signal<Perfil | null>(null);
  permisosUI = signal<ModuloPermisoUI[]>([]);
  permisosTreeNodes = signal<TreeNode[]>([]);
  savingPermisos = signal(false);

  // Computed
  isEditing = computed(() => this.editingPerfil() !== null);
  dialogTitle = computed(() => this.isEditing() ? 'Editar Perfil' : 'Nuevo Perfil');

  // Perfiles protegidos (no se pueden eliminar ni editar permisos)
  protectedProfiles = [1]; // SuperAdmin

  // Dependencias entre módulos: { modulo: [módulos de los que depende] }
  // Si un módulo depende de otro, no se puede quitar el permiso del dependiente
  // sin quitar primero el del que depende de él
  moduloDependencies: { [vista: string]: string[] } = {
    // Animales depende de sus catálogos para funcionar correctamente
    'Animals': ['Animals/Breeds', 'Animals/Colors', 'Animals/HairTypes', 'Animals/PhysicalConditions'],
    // Reproducción depende de Animales
    'Reproduction': ['Animals'],
    'Reproduction/temporadas-monta': ['Animals', 'Reproduction'],
    'Reproduction/diagnostico-prenez': ['Animals', 'Reproduction'],
    'Reproduction/partos': ['Animals', 'Reproduction'],
    'Reproduction/lactancia': ['Animals', 'Reproduction'],
    'Reproduction/estados-reproductivos': ['Animals', 'Reproduction'],
    // Certificados depende de Animales y Clasificadores
    'Certificates': ['Animals', 'Classifiers'],
  };

  ngOnInit(): void {
    this.loadPerfiles();
    this.loadModulos();
  }

  loadPerfiles(page: number = 1): void {
    this.loading.set(true);
    this.perfilesService.getPerfiles(page, this.rows).subscribe({
      next: (response) => {
        this.perfiles.set(response.data);
        this.totalRecords.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los perfiles'
        });
        this.loading.set(false);
      }
    });
  }

  loadModulos(): void {
    this.perfilesService.getModulosFlat().subscribe({
      next: (modulos) => {
        this.modulosFlat.set(modulos);
      },
      error: (err) => {
        console.error('Error cargando módulos', err);
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    const page = Math.floor(event.first / event.rows) + 1;
    this.loadPerfiles(page);
  }

  // ==================== CRUD Perfil ====================

  openNewPerfilDialog(): void {
    this.editingPerfil.set(null);
    this.perfilNombre.set('');
    this.showPerfilDialog.set(true);
  }

  openEditPerfilDialog(perfil: Perfil): void {
    if (this.protectedProfiles.includes(perfil.id_perfil)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se puede editar el perfil SuperAdmin'
      });
      return;
    }
    this.editingPerfil.set(perfil);
    this.perfilNombre.set(perfil.descripcion);
    this.showPerfilDialog.set(true);
  }

  savePerfil(): void {
    const nombre = this.perfilNombre().trim();
    if (!nombre) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El nombre del perfil es requerido'
      });
      return;
    }

    this.savingPerfil.set(true);

    if (this.isEditing()) {
      const perfil = this.editingPerfil()!;
      this.perfilesService.updatePerfil(perfil.id_perfil, nombre).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Perfil actualizado correctamente'
          });
          this.showPerfilDialog.set(false);
          this.loadPerfiles();
          this.savingPerfil.set(false);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al actualizar el perfil'
          });
          this.savingPerfil.set(false);
        }
      });
    } else {
      this.perfilesService.createPerfil(nombre).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Perfil creado correctamente'
          });
          this.showPerfilDialog.set(false);
          this.loadPerfiles();
          this.savingPerfil.set(false);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al crear el perfil'
          });
          this.savingPerfil.set(false);
        }
      });
    }
  }

  confirmDeletePerfil(perfil: Perfil): void {
    if (this.protectedProfiles.includes(perfil.id_perfil) || perfil.id_perfil <= 3) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se pueden eliminar los perfiles base del sistema'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el perfil "${perfil.descripcion}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deletePerfil(perfil);
      }
    });
  }

  deletePerfil(perfil: Perfil): void {
    this.perfilesService.deletePerfil(perfil.id_perfil).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Perfil eliminado correctamente'
        });
        this.loadPerfiles();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Error al eliminar el perfil'
        });
      }
    });
  }

  // ==================== Gestión de Permisos ====================

  openPermisosDialog(perfil: Perfil): void {
    if (this.protectedProfiles.includes(perfil.id_perfil)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se pueden modificar los permisos del SuperAdmin'
      });
      return;
    }

    this.selectedPerfil.set(perfil);
    this.loadingPermisos.set(true);
    this.showPermisosDialog.set(true);

    this.perfilesService.getPermisos(perfil.id_perfil).subscribe({
      next: (data) => {
        this.buildPermisosUI(data.permisos);
        this.loadingPermisos.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los permisos'
        });
        this.loadingPermisos.set(false);
      }
    });
  }

  buildPermisosUI(permisosActuales: PerfilModulo[]): void {
    const modulos = this.modulosFlat();
    const permisosMap = new Map<number, PerfilModulo>();
    
    permisosActuales.forEach(p => permisosMap.set(p.id_modulo, p));

    const permisosUI: ModuloPermisoUI[] = modulos.map(modulo => {
      const permisoExistente = permisosMap.get(modulo.id);
      const nivel = this.calcularNivel(modulo, modulos);
      
      return {
        id_modulo: modulo.id,
        modulo: modulo,
        nombre: modulo.modulo,
        nivel: nivel,
        puede_ver: permisoExistente?.puede_ver ?? false,
        puede_crear: permisoExistente?.puede_crear ?? false,
        puede_editar: permisoExistente?.puede_editar ?? false,
        puede_eliminar: permisoExistente?.puede_eliminar ?? false,
        vista_inicio: permisoExistente?.vista_inicio ?? 0
      };
    });

    this.permisosUI.set(permisosUI);
    
    // Construir TreeNodes para TreeTable
    this.permisosTreeNodes.set(this.buildTreeNodes(permisosUI, modulos));
  }

  buildTreeNodes(permisosUI: ModuloPermisoUI[], modulos: Modulo[]): TreeNode[] {
    const nodeMap = new Map<number, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Crear nodos para cada módulo
    permisosUI.forEach(permiso => {
      const node: TreeNode = {
        data: permiso,
        children: [],
        expanded: true
      };
      nodeMap.set(permiso.id_modulo, node);
    });

    // Construir jerarquía
    permisosUI.forEach(permiso => {
      const node = nodeMap.get(permiso.id_modulo)!;
      const modulo = permiso.modulo;
      
      if (modulo?.padre_id) {
        const parentNode = nodeMap.get(modulo.padre_id);
        if (parentNode) {
          parentNode.children!.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Ordenar nodos por orden del módulo
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => (a.data.modulo?.orden || 0) - (b.data.modulo?.orden || 0));
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };
    sortNodes(rootNodes);

    return rootNodes;
  }

  calcularNivel(modulo: Modulo, modulos: Modulo[]): number {
    let nivel = 0;
    let current = modulo;
    while (current.padre_id) {
      nivel++;
      current = modulos.find(m => m.id === current.padre_id)!;
      if (!current) break;
    }
    return nivel;
  }

  getOrdenCompleto(modulo: Modulo, modulos: Modulo[]): string {
    const partes: string[] = [];
    let current: Modulo | undefined = modulo;
    
    while (current) {
      partes.unshift(current.orden.toString().padStart(3, '0'));
      if (current.padre_id) {
        current = modulos.find(m => m.id === current!.padre_id);
      } else {
        break;
      }
    }
    
    return partes.join('-');
  }

  onPuedeVerChange(permiso: ModuloPermisoUI): void {
    if (!permiso.puede_ver) {
      // Quitar todos los permisos del módulo actual
      permiso.puede_crear = false;
      permiso.puede_editar = false;
      permiso.puede_eliminar = false;
      
      // Propagar hacia los hijos: quitar "ver" de todos los submódulos
      this.propagateRemoveVerToChildren(permiso.id_modulo);
      
      // Quitar "ver" de módulos que dependen de este
      this.removeVerFromDependentModules(permiso.modulo?.vista || '');
    } else {
      // Al activar "ver", activar también los módulos de los que depende
      this.activateDependencies(permiso.modulo?.vista || '');
    }
    
    // Reconstruir el árbol para reflejar los cambios
    this.permisosTreeNodes.set(this.buildTreeNodes(this.permisosUI(), this.modulosFlat()));
  }

  /**
   * Propaga la eliminación del permiso "ver" a todos los hijos de un módulo
   */
  private propagateRemoveVerToChildren(parentId: number): void {
    const permisos = this.permisosUI();
    const modulos = this.modulosFlat();
    
    // Encontrar todos los hijos directos e indirectos
    const childIds = this.getAllChildIds(parentId, modulos);
    
    permisos.forEach(p => {
      if (childIds.includes(p.id_modulo)) {
        p.puede_ver = false;
        p.puede_crear = false;
        p.puede_editar = false;
        p.puede_eliminar = false;
      }
    });
  }

  /**
   * Obtiene todos los IDs de hijos (directos e indirectos) de un módulo
   */
  private getAllChildIds(parentId: number, modulos: Modulo[]): number[] {
    const childIds: number[] = [];
    
    const findChildren = (pid: number) => {
      modulos.forEach(m => {
        if (m.padre_id === pid) {
          childIds.push(m.id);
          findChildren(m.id); // Recursivo para nietos
        }
      });
    };
    
    findChildren(parentId);
    return childIds;
  }

  /**
   * Quita el permiso "ver" de módulos que dependen del módulo dado
   */
  private removeVerFromDependentModules(vista: string): void {
    if (!vista) return;
    
    const permisos = this.permisosUI();
    
    // Buscar módulos que dependen de este
    Object.entries(this.moduloDependencies).forEach(([moduloVista, dependencias]) => {
      if (dependencias.includes(vista)) {
        // Este módulo depende del que estamos quitando
        const permiso = permisos.find(p => p.modulo?.vista === moduloVista);
        if (permiso && permiso.puede_ver) {
          permiso.puede_ver = false;
          permiso.puede_crear = false;
          permiso.puede_editar = false;
          permiso.puede_eliminar = false;
          
          // Propagar también a los hijos de este módulo
          this.propagateRemoveVerToChildren(permiso.id_modulo);
          
          // Recursivamente quitar de módulos que dependen de este
          this.removeVerFromDependentModules(moduloVista);
        }
      }
    });
  }

  /**
   * Al activar "ver" en un módulo, activa también los módulos de los que depende
   */
  private activateDependencies(vista: string): void {
    if (!vista) return;
    
    const dependencias = this.moduloDependencies[vista];
    if (!dependencias) return;
    
    const permisos = this.permisosUI();
    const modulos = this.modulosFlat();
    
    dependencias.forEach(depVista => {
      const permiso = permisos.find(p => p.modulo?.vista === depVista);
      if (permiso && !permiso.puede_ver) {
        permiso.puede_ver = true;
        
        // También activar el padre si existe
        const modulo = modulos.find(m => m.id === permiso.id_modulo);
        if (modulo?.padre_id) {
          const parentPermiso = permisos.find(p => p.id_modulo === modulo.padre_id);
          if (parentPermiso && !parentPermiso.puede_ver) {
            parentPermiso.puede_ver = true;
            // Recursivamente activar padres
            this.activateParentModules(modulo.padre_id);
          }
        }
        
        // Recursivamente activar dependencias de la dependencia
        this.activateDependencies(depVista);
      }
    });
  }

  /**
   * Activa el permiso "ver" en todos los módulos padre
   */
  private activateParentModules(moduleId: number): void {
    const permisos = this.permisosUI();
    const modulos = this.modulosFlat();
    
    const modulo = modulos.find(m => m.id === moduleId);
    if (modulo?.padre_id) {
      const parentPermiso = permisos.find(p => p.id_modulo === modulo.padre_id);
      if (parentPermiso && !parentPermiso.puede_ver) {
        parentPermiso.puede_ver = true;
        this.activateParentModules(modulo.padre_id);
      }
    }
  }

  savePermisos(): void {
    const perfil = this.selectedPerfil();
    if (!perfil) return;

    this.savingPermisos.set(true);

    const modulos: ModuloPermiso[] = this.permisosUI().map(p => ({
      id_modulo: p.id_modulo,
      puede_ver: p.puede_ver,
      puede_crear: p.puede_crear,
      puede_editar: p.puede_editar,
      puede_eliminar: p.puede_eliminar,
      vista_inicio: p.vista_inicio
    }));

    this.perfilesService.updatePermisos(perfil.id_perfil, modulos).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Permisos actualizados correctamente'
        });
        this.showPermisosDialog.set(false);
        this.savingPermisos.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Error al actualizar los permisos'
        });
        this.savingPermisos.set(false);
      }
    });
  }

  getPerfilTag(perfil: Perfil): { severity: string; label: string } {
    switch (perfil.id_perfil) {
      case 1:
        return { severity: 'danger', label: 'SuperAdmin' };
      case 2:
        return { severity: 'warning', label: 'Admin' };
      case 3:
        return { severity: 'info', label: 'Usuario' };
      default:
        return { severity: 'secondary', label: 'Personalizado' };
    }
  }

  canEditPerfil(perfil: Perfil): boolean {
    return !this.protectedProfiles.includes(perfil.id_perfil);
  }

  canDeletePerfil(perfil: Perfil): boolean {
    return perfil.id_perfil > 3;
  }
}
