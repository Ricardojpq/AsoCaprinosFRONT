import { Routes } from '@angular/router';

export const REPRODUCCION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'temporadas-monta',
    pathMatch: 'full'
  },
  {
    path: 'temporadas-monta',
    loadComponent: () =>
      import('./pages/temporadas-monta/temporadas-monta').then(
        (c) => c.TemporadasMonta
      ),
  },
  {
    path: 'diagnostico-prenez',
    loadComponent: () =>
      import('./pages/diagnostico-prenez/diagnostico-prenez').then(
        (c) => c.DiagnosticoPrenezComponent
      ),
  },
  {
    path: 'partos',
    loadComponent: () =>
      import('./pages/partos/partos').then((c) => c.Partos),
  },
  {
    path: 'lactancia',
    loadComponent: () =>
      import('./pages/lactancia/lactancia').then((c) => c.Lactancia),
  },
    {
    path: 'estados-animal',
    loadComponent: () =>
      import('./pages/estados-animal/estados-animal').then((c) => c.EstadosAnimal),
  },
  {
    path: 'estados-reproductivos',
    loadComponent: () =>
      import('./pages/estados-reproductivos/estados-reproductivos').then((c) => c.EstadosReproductivosComponent),
  },
];
