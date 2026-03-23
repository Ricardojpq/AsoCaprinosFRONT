import { Routes } from '@angular/router';
import { Layout } from '@layout/layout';
import { AuthGuard } from '@core/guards/auth-guard';
import { NoAuthGuard } from '@core/guards/no-auth-guard';
import { CanDeactivateAnimalFormGuard } from '@core/guards/can-deactivate-animal-form.guard';
import { SuperAdminGuard } from '@core/guards/role-guard';
import { modulePermissionGuard } from '@core/guards/module-permission.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'Dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'Dashboard',
        loadComponent: () =>
          import('@features/dashboard/dashboard').then((c) => c.Dashboard),
      },
      {
        path: 'Animals',
        canActivate: [modulePermissionGuard('Animals')],
        loadComponent: () =>
          import('@features/animals/containers/animals-container.component').then(
            (c) => c.AnimalsContainerComponent
          ),
        canDeactivate: [CanDeactivateAnimalFormGuard],
      },
      {
        path: 'Animals/Breeds',
        canActivate: [modulePermissionGuard('Animals/Breeds')],
        loadComponent: () =>
          import('@features/animals/catalogs/breeds/breeds').then(
            (c) => c.Breeds
          ),
      },
      {
        path: 'Animals/HairTypes',
        canActivate: [modulePermissionGuard('Animals/HairTypes')],
        loadComponent: () =>
          import('@features/animals/catalogs/hair-type/hair-type').then(
            (c) => c.HairType
          ),
      },
      {
        path: 'Animals/Colors',
        canActivate: [modulePermissionGuard('Animals/Colors')],
        loadComponent: () =>
          import('@features/animals/catalogs/colors/colors').then(
            (c) => c.Colors
          ),
      },
      {
        path: 'Animals/PhysicalConditions',
        canActivate: [modulePermissionGuard('Animals/PhysicalConditions')],
        loadComponent: () =>
          import(
            '@features/animals/catalogs/physical-condition/physical-condition'
          ).then((c) => c.PhysicalCondition),
      },
      {
        path: 'Animals/Estados',
        canActivate: [modulePermissionGuard('Animals')],
        loadComponent: () =>
          import('@features/animals/pages/estados/estados').then(
            (c) => c.EstadosComponent
          ),
      },
      {
        path: 'PoliticalDivision',
        canActivate: [modulePermissionGuard('PoliticalDivision')],
        loadComponent: () =>
          import('@features/political-division/political-division').then(
            (c) => c.PoliticalDivisionComponent
          ),
      },
      {
        path: 'Certificates',
        canActivate: [modulePermissionGuard('Certificates')],
        loadComponent: () =>
          import('@features/certificates/certificates').then(
            (c) => c.Certificates
          ),
      },
      {
        path: 'Members',
        canActivate: [modulePermissionGuard('Members')],
        loadComponent: () =>
          import('@features/members/members').then((c) => c.Members),
      },
      {
        path: 'Classifiers',
        canActivate: [modulePermissionGuard('Classifiers')],
        loadComponent: () =>
          import('@features/classifiers/classifiers').then(
            (c) => c.Classifiers
          ),
      },
      {
        path: 'Companies',
        canActivate: [modulePermissionGuard('Classifiers')],
        loadComponent: () =>
          import('@features/companies/companies').then((c) => c.Companies),
      },
      {
        path: 'Farms',
        canActivate: [modulePermissionGuard('Farms')],
        loadComponent: () =>
          import('@features/farms/farms').then((c) => c.Farms),
      },
      {
        path: 'Account',
        loadComponent: () =>
          import('@features/account/account').then((c) => c.Account),
      },
      {
        path: 'Users',
        canActivate: [SuperAdminGuard],
        loadComponent: () =>
          import('@features/users/pages/user-management/user-management').then(
            (c) => c.UserManagementComponent
          ),
      },
      {
        path: 'Settings/Profiles',
        canActivate: [SuperAdminGuard],
        loadComponent: () =>
          import('@features/users/components/profiles/profiles').then(
            (c) => c.Profiles
          ),
      },
      {
        path: 'Settings/Parameters',
        canActivate: [modulePermissionGuard('Settings/Parameters')],
        loadComponent: () =>
          import('@features/reproduccion/pages/configuracion/configuracion').then(
            (c) => c.Configuracion
          ),
      },
      {
        path: 'Reproduccion',
        loadChildren: () =>
          import('@features/reproduccion/reproduccion.routes').then(
            (r) => r.REPRODUCCION_ROUTES
          ),
      },
    ],
  },
  {
    path: 'Auth',
    children: [
      {
        path: 'Login',
        canActivate: [NoAuthGuard],
        loadComponent: () =>
          import('@features/auth/components/login/login').then((c) => c.Login),
      },
    ],
  },
];
