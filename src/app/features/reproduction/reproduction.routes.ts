import { Routes } from '@angular/router';
import { modulePermissionGuard } from '@core/guards/module-permission.guard';

export const REPRODUCCION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [modulePermissionGuard('Reproduction')],
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(
        (c) => c.DashboardReproduccionComponent
      ),
  },
  {
    path: 'temporadas-monta',
    canActivate: [modulePermissionGuard('Reproduction/temporadas-monta')],
    loadComponent: () =>
      import('./pages/mating-season/mating-season').then(
        (c) => c.MatingSeason
      ),
  },
  {
    path: 'diagnostico-prenez',
    canActivate: [modulePermissionGuard('Reproduction/diagnostico-prenez')],
    loadComponent: () =>
      import('./pages/pregnancy-diagnosis/pregnancy-diagnosis').then(
        (c) => c.DiagnosticoPrenezComponent
      ),
  },
  {
    path: 'partos',
    canActivate: [modulePermissionGuard('Reproduction/partos')],
    loadComponent: () =>
      import('./pages/parturitions/parturitions').then((c) => c.Partos),
  },
  {
    path: 'lactancia',
    canActivate: [modulePermissionGuard('Reproduction/lactancia')],
    loadComponent: () =>
      import('./pages/lactation/lactation').then((c) => c.Lactation),
  },
  {
    path: 'estados-animal',
    canActivate: [modulePermissionGuard('Reproduction/estados-reproductivos')],
    loadComponent: () =>
      import('./pages/animal-status/animal-status').then((c) => c.AnimalStatus),
  },
  {
    path: 'estados-reproductivos',
    canActivate: [modulePermissionGuard('Reproduction/estados-reproductivos')],
    loadComponent: () =>
      import('./pages/reproductive-status/reproductive-status').then((c) => c.EstadosReproductivosComponent),
  },
  {
    path: 'tatuar-crias',
    canActivate: [modulePermissionGuard('Reproduction/tatuar-crias')],
    loadComponent: () =>
      import('./pages/tattoo/tattoo').then((c) => c.TatuarCriasComponent),
  },
];
