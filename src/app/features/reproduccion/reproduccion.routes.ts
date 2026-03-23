import { Routes } from '@angular/router';
import { modulePermissionGuard } from '@core/guards/module-permission.guard';

export const REPRODUCCION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'temporadas-monta',
    pathMatch: 'full'
  },
  {
    path: 'temporadas-monta',
    canActivate: [modulePermissionGuard('Reproduccion/temporadas-monta')],
    loadComponent: () =>
      import('./pages/temporadas-monta/temporadas-monta').then(
        (c) => c.TemporadasMonta
      ),
  },
  {
    path: 'diagnostico-prenez',
    canActivate: [modulePermissionGuard('Reproduccion/diagnostico-prenez')],
    loadComponent: () =>
      import('./pages/diagnostico-prenez/diagnostico-prenez').then(
        (c) => c.DiagnosticoPrenezComponent
      ),
  },
  {
    path: 'partos',
    canActivate: [modulePermissionGuard('Reproduccion/partos')],
    loadComponent: () =>
      import('./pages/partos/partos').then((c) => c.Partos),
  },
  {
    path: 'lactancia',
    canActivate: [modulePermissionGuard('Reproduccion/lactancia')],
    loadComponent: () =>
      import('./pages/lactancia/lactancia').then((c) => c.Lactancia),
  },
  {
    path: 'estados-animal',
    canActivate: [modulePermissionGuard('Reproduccion/estados-reproductivos')],
    loadComponent: () =>
      import('./pages/estados-animal/estados-animal').then((c) => c.EstadosAnimal),
  },
  {
    path: 'estados-reproductivos',
    canActivate: [modulePermissionGuard('Reproduccion/estados-reproductivos')],
    loadComponent: () =>
      import('./pages/estados-reproductivos/estados-reproductivos').then((c) => c.EstadosReproductivosComponent),
  },
];
