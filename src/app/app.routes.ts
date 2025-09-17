import { animate } from '@angular/animations';
import { Routes } from '@angular/router';
import { App } from './app';
import { Layout } from '@layout/layout';
import { AuthGuard } from '@core/guards/auth-guard';
import { NoAuthGuard } from '@core/guards/no-auth-guard';
import { CanDeactivateGuard } from '@core/guards/can-deactivate-guard';
import { CertificatePage1 } from '@features/certificates/components/certificate-page1/certificate-page1';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'Dashboard',
        pathMatch: 'full'
    },
    {
        path: '',
        component: Layout,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'Dashboard',
                loadComponent: () => import('@features/dashboard/dashboard').then(c => c.Dashboard)
            },
            {
                path: 'Animals',
                loadComponent: () => import('@features/animals/animals').then(c => c.Animals),
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'Animals/Breeds',
                loadComponent: () => import('@features/animals/catalogs/breeds/breeds').then(c => c.Breeds)
            },
            {
                path: 'Animals/HairTypes',
                loadComponent: () => import('@features/animals/catalogs/hair-type/hair-type').then(c => c.HairType)
            },
            {
                path: 'Animals/Colors',
                loadComponent: () => import('@features/animals/catalogs/colors/colors').then(c => c.Colors)
            },
            {
                path: 'Animals/PhysicalConditions',
                loadComponent: () => import('@features/animals/catalogs/physical-condition/physical-condition').then(c => c.PhysicalCondition)
            },
            {
                path: 'Certificates',
                loadComponent: () => import('@features/certificates/certificates').then(c => c.Certificates)
            },
            {
                path: 'Members',
                loadComponent: () => import('@features/members/members').then(c => c.Members)
            },
            {
                path: 'test',
                loadComponent: () => import('@features/certificates/components/certificate-page1/certificate-page1').then(c => c.CertificatePage1)
            }
        ]
    },
    {
        path:'Auth',
        children:[
            {
                path:'Login',
                canActivate: [NoAuthGuard],
                loadComponent: () => import('@features/auth/components/login/login').then(c => c.Login)
            },
            {
                path:'JwtTest',
                loadComponent: () => import('@features/auth/components/oauth-test/oauth-test').then(c => c.JwtTest)
            }
        ]
    }
];
