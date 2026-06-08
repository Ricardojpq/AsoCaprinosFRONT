import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { AuthService } from '@features/auth/services/auth.service';

export interface ModuloPermiso {
  id_modulo: number;
  modulo: string;
  vista: string;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private authService = inject(AuthService);
  
  private permisosMap = signal<Map<string, ModuloPermiso>>(new Map());
  private readonly vistaAliases: ReadonlyArray<[string, string]> = [
    ['reproduction', 'reproduccion'],
    ['corrals', 'corrales'],
  ];
  
  readonly isSuperAdmin = computed(() => {
    const user = this.authService.user();
    return user?.perfil_id === 1 || user?.id_perfil_usuario === 1 || user?.is_super_admin === true;
  });

  constructor() {
    // Cargar permisos cuando el usuario cambie usando effect
    effect(() => {
      this.loadPermisosFromUser();
    });
  }

  private loadPermisosFromUser(): void {
    const user = this.authService.user();
    const map = new Map<string, ModuloPermiso>();

    if (user?.perfil?.perfil_modulos) {
      for (const pm of user.perfil.perfil_modulos) {
        if (!pm.modulo?.vista) {
          continue;
        }

        const permiso: ModuloPermiso = {
          id_modulo: pm.id_modulo,
          modulo: pm.modulo.modulo,
          vista: pm.modulo.vista,
          puede_ver: pm.puede_ver,
          puede_crear: pm.puede_crear,
          puede_editar: pm.puede_editar,
          puede_eliminar: pm.puede_eliminar
        };

        for (const candidate of this.getVistaCandidates(pm.modulo.vista)) {
          map.set(candidate, permiso);
        }
      }
    }

    this.permisosMap.set(map);
  }

  private normalizeVista(vista: string): string {
    return vista.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  }

  private swapAlias(value: string, from: string, to: string): string {
    const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const segmentRegex = new RegExp(`(^|/)${escapedFrom}(?=/|$)`, 'g');
    return value.replace(segmentRegex, (_, prefix: string) => `${prefix}${to}`);
  }

  private getVistaCandidates(vista: string): string[] {
    const base = this.normalizeVista(vista);
    if (!base) {
      return [];
    }

    const candidates = new Set<string>([base]);

    for (const [left, right] of this.vistaAliases) {
      const snapshot = Array.from(candidates);
      for (const candidate of snapshot) {
        candidates.add(this.swapAlias(candidate, left, right));
        candidates.add(this.swapAlias(candidate, right, left));
      }
    }

    return Array.from(candidates);
  }

  private findPermission(vista: string): ModuloPermiso | undefined {
    const map = this.permisosMap();
    for (const candidate of this.getVistaCandidates(vista)) {
      const permiso = map.get(candidate);
      if (permiso) {
        return permiso;
      }
    }
    return undefined;
  }

  /**
   * Recarga los permisos del usuario actual
   */
  reloadPermisos(): void {
    this.loadPermisosFromUser();
  }

  /**
   * Verifica si el usuario puede ver un módulo
   * @param vista La vista/ruta del módulo (ej: 'Animals', 'Reproduction/partos')
   */
  canView(vista: string): boolean {
    if (this.isSuperAdmin()) return true;
    const permiso = this.findPermission(vista);
    return permiso?.puede_ver ?? false;
  }

  /**
   * Verifica si el usuario puede crear en un módulo
   */
  canCreate(vista: string): boolean {
    if (this.isSuperAdmin()) return true;
    const permiso = this.findPermission(vista);
    return permiso?.puede_crear ?? false;
  }

  /**
   * Verifica si el usuario puede editar en un módulo
   */
  canEdit(vista: string): boolean {
    if (this.isSuperAdmin()) return true;
    const permiso = this.findPermission(vista);
    return permiso?.puede_editar ?? false;
  }

  /**
   * Verifica si el usuario puede eliminar en un módulo
   */
  canDelete(vista: string): boolean {
    if (this.isSuperAdmin()) return true;
    const permiso = this.findPermission(vista);
    return permiso?.puede_eliminar ?? false;
  }

  /**
   * Obtiene todos los permisos de un módulo
   */
  getModulePermissions(vista: string): ModuloPermiso | null {
    if (this.isSuperAdmin()) {
      return {
        id_modulo: 0,
        modulo: vista,
        vista: vista,
        puede_ver: true,
        puede_crear: true,
        puede_editar: true,
        puede_eliminar: true
      };
    }
    return this.findPermission(vista) ?? null;
  }

  /**
   * Verifica si el usuario tiene acceso a una ruta específica
   * Útil para guards de rutas
   */
  hasRouteAccess(route: string): boolean {
    if (this.isSuperAdmin()) return true;

    const normalizedRoute = this.normalizeVista(route.replace(/^\//, ''));
    const candidates = this.getVistaCandidates(normalizedRoute);

    for (const candidate of candidates) {
      const permiso = this.permisosMap().get(candidate);
      if (permiso?.puede_ver) {
        return true;
      }
    }

    for (const [vista, perm] of this.permisosMap().entries()) {
      for (const candidate of candidates) {
        if (candidate.startsWith(vista) && perm.puede_ver) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Obtiene todas las vistas que el usuario puede ver
   */
  getVisibleModules(): string[] {
    if (this.isSuperAdmin()) return ['*'];
    
    const visibles: string[] = [];
    for (const [vista, permiso] of this.permisosMap().entries()) {
      if (permiso.puede_ver) {
        visibles.push(vista);
      }
    }
    return visibles;
  }
}
