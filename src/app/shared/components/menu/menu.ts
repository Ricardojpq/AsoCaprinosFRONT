import { CommonModule } from '@angular/common';
import { Component, inject, computed, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from '@core/models/menu-item';
import { PermissionsService } from '@core/services/permissions.service';
import { AppMenuItem } from '@shared/components/menu-item/menu-item';
import {
  LucideAngularModule,
  Home,
  ChevronLeft,
  ChevronRight,
  User,
  Award,
  PawPrint,
  Users,
  SlidersHorizontal,
  Settings,
  ScrollText,
  MapPin,
  IdCard,
  Building2,
  NotebookPen,
  Tractor,
  Baby,
  Dna,
} from 'lucide-angular';
@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule, AppMenuItem, LucideAngularModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  private permissionsService = inject(PermissionsService);
  menuModel: MenuItem[] = [];
  readonly homeIcon = Home;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly userIcon = User;
  readonly awardIcon = Award;
  readonly pawPrintIcon = PawPrint;
  readonly usersIcon = Users;
  readonly slidersHorizontalIcon = SlidersHorizontal;
  readonly settingsIcon = Settings;
  readonly scrollTextIcon = ScrollText;
  readonly mapPinIcon = MapPin;
  readonly idCardIcon = IdCard;
  readonly building2Icon = Building2;
  readonly notebookPenIcon = NotebookPen;
  readonly tractorIcon = Tractor;
  readonly babyIcon = Baby;
  readonly dnaIcon = Dna;

  constructor() {
    // Recargar menú cuando cambien los permisos
    effect(() => {
      this.permissionsService.isSuperAdmin(); // Trigger para detectar cambios
      this.buildMenu();
    });
  }

  ngOnInit() {
    this.buildMenu();
  }

  private buildMenu(): void {
    const fullMenu: MenuItem[] = this.getFullMenu();
    this.menuModel = this.filterMenuByPermissions(fullMenu);
  }

  private filterMenuByPermissions(menu: MenuItem[]): MenuItem[] {
    return menu
      .map(group => {
        if (group.separator) return group;
        
        if (group.items) {
          const filteredItems = group.items
            .map(item => this.filterMenuItem(item))
            .filter(item => item !== null) as MenuItem[];
          
          if (filteredItems.length === 0) return null;
          return { ...group, items: filteredItems };
        }
        return group;
      })
      .filter(group => group !== null) as MenuItem[];
  }

  private filterMenuItem(item: MenuItem): MenuItem | null {
    // Obtener la vista del módulo
    const vista = item.moduleVista || (item.routerLink ? item.routerLink[0] : null);
    
    // Si tiene vista, verificar permiso
    if (vista && !this.permissionsService.canView(vista)) {
      return null;
    }

    // Si tiene subitems, filtrarlos recursivamente
    if (item.items && item.items.length > 0) {
      const filteredItems = item.items
        .map(subItem => this.filterMenuItem(subItem))
        .filter(subItem => subItem !== null) as MenuItem[];
      
      // Si no quedan subitems visibles, ocultar el padre también
      if (filteredItems.length === 0) {
        return null;
      }
      
      return { ...item, items: filteredItems };
    }

    return item;
  }

  private getFullMenu(): MenuItem[] {
    return [
      {
        items: [
          {
            label: 'Dashboard',
            icon: this.homeIcon,
            routerLink: ['Dashboard'],
          },
        ],
      },
      {
        items: [
          {
            label: 'Clasificadores',
            icon: this.notebookPenIcon,
            routerLink: ['Classifiers'],
          },
        ],
      },
      {
        items: [
          {
            label: 'Certificados',
            icon: this.scrollTextIcon,
            routerLink: ['Certificates'],
          },
        ],
      },
      {
        items: [
          {
            label: 'Animales',
            icon: this.pawPrintIcon,
            items: [
              { label: 'Registrar Animal', routerLink: ['Animals'] },
              { label: 'Gestión de Estados', routerLink: ['Animals/Estados'] },
              {
                label: 'Catálogos',
                routerLink: ['AnimalCatalogs'],
                items: [
                  {
                    label: 'Razas',
                    routerLink: ['Animals/Breeds'],
                  },
                  {
                    label: 'Tipo Pelo',
                    routerLink: ['Animals/HairTypes'],
                  },
                  {
                    label: 'Colores',
                    routerLink: ['Animals/Colors'],
                  },
                  {
                    label: 'Condicion Corporal',
                    routerLink: ['Animals/PhysicalConditions'],
                  },
                ],
              },
            ],
            routerLink: ['Animals'],
          },
        ],
      },
      {
        items: [
          {
            label: 'Division Politica',
            icon: this.mapPinIcon,
            routerLink: ['PoliticalDivision'],
          },
        ],
      },
      {
        items: [
          { label: 'Socios', icon: this.usersIcon, routerLink: ['Members'] },
        ],
      },
      {
        items: [
          {
            label: 'Fincas',
            icon: this.tractorIcon,
            routerLink: ['Farms'],
          },
        ],
      },
      {
        items: [
          {
            label: 'Reproducción',
            icon: this.dnaIcon,
            items: [
              { label: 'Temporadas de Monta', routerLink: ['Reproduction/temporadas-monta'] },
              { label: 'Diagnóstico de Preñez', routerLink: ['Reproduction/diagnostico-prenez'] },
              { label: 'Partos', routerLink: ['Reproduction/partos'] },
              { label: 'Lactancia', routerLink: ['Reproduction/lactancia'] },
              { label: 'Estados Reproductivos', routerLink: ['Reproduction/estados-reproductivos'] },
            ],
          },
        ],
      },
      {
        separator: true,
      },
      {
        items: [
          {
            label: 'Configuración',
            icon: this.settingsIcon,
            items: [
              { label: 'Parámetros del Sistema', routerLink: ['Settings/Parameters'] },
              { label: 'Gestión de Perfiles', routerLink: ['Settings/Profiles'] },
              { label: 'Gestión de Usuarios', routerLink: ['Users'] },
            ],
          },
        ],
      },
      //   {
      //     label: 'Configuración',
      //     icon: this.settingsIcon,
      //     items: [
      //       {
      //         label: 'General',
      //         icon: this.slidersHorizontalIcon,
      //         routerLink: ['settings/general'],
      //       },
      //       {
      //         label: 'Usuarios',
      //         icon: this.usersIcon,
      //         routerLink: ['settings/users'],
      //       },
      //     ],
      //   },
      //   {
      //     label: 'Submenu 2',
      //     items: [
      //       {
      //         label: 'Submenu 2.1',
      //         items: [{ label: 'Submenu 2.1.1' }, { label: 'Submenu 2.1.2' }],
      //       },
      //       {
      //         label: 'Submenu 2.2',
      //         items: [{ label: 'Submenu 2.2.1' }],
      //       },
      //     ],
      //   },
    ];
  }
}
