import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoliticalDivisionService } from './Services/political-division-service';
import { 
  TabConfig
} from './models/political-division.dto';

// PrimeNG Imports
import { TabsModule } from 'primeng/tabs';

// Child Components
import { CountriesTabComponent } from './components/countries-tab/countries-tab.component';
import { StatesTabComponent } from './components/states-tab/states-tab.component';
import { MunicipalitiesTabComponent } from './components/municipalities-tab/municipalities-tab.component';
import { ParishesTabComponent } from './components/parishes-tab/parishes-tab.component';
import { CitiesTabComponent } from './components/cities-tab/cities-tab.component';

@Component({
  selector: 'app-political-division',
  templateUrl: './political-division.html',
  styleUrls: ['./political-division.css'],
  providers: [PoliticalDivisionService],
  imports: [
    CommonModule,
    TabsModule,
    CountriesTabComponent,
    StatesTabComponent,
    MunicipalitiesTabComponent,
    ParishesTabComponent,
    CitiesTabComponent
  ]
})
export class PoliticalDivisionComponent implements OnInit {
  
  // ============= CONFIGURACIÓN DE TABS =============
  tabs: TabConfig[] = [
    {
      key: 'paises',
      label: 'Países',
      icon: 'pi pi-globe',
      hasCreate: true,
      hasUpdate: true,
      hasDelete: true
    },
    {
      key: 'estados',
      label: 'Estados',
      icon: 'pi pi-map',
      hasCreate: true,
      hasUpdate: true,
      hasDelete: true
    },
    {
      key: 'municipios',
      label: 'Municipios',
      icon: 'pi pi-building',
      hasCreate: true,
      hasUpdate: true,
      hasDelete: true
    },
    {
      key: 'parroquias',
      label: 'Parroquias',
      icon: 'pi pi-home',
      hasCreate: true,
      hasUpdate: true,
      hasDelete: true
    },
    {
      key: 'ciudades',
      label: 'Ciudades',
      icon: 'pi pi-map-marker',
      hasCreate: true,
      hasUpdate: true,
      hasDelete: true
    }
  ];

  activeTabIndex: number = 0;

  constructor(
    private politicalDivisionService: PoliticalDivisionService
  ) {}

  ngOnInit(): void {
    // Componente simplificado sin filtros jerárquicos
  }

  // ============= MÉTODOS DE NAVEGACIÓN =============

  /**
   * Cambiar tab activo
   */
  onTabChange(event: any): void {
    this.activeTabIndex = parseInt(event.index);
  }

  /**
   * Obtener tab actual
   */
  getCurrentTab(): TabConfig {
    return this.tabs[this.activeTabIndex];
  }

  /**
   * Verificar si el tab actual permite crear
   */
  canCreate(): boolean {
    return this.getCurrentTab().hasCreate;
  }

  /**
   * Verificar si el tab actual permite actualizar
   */
  canUpdate(): boolean {
    return this.getCurrentTab().hasUpdate;
  }

  /**
   * Verificar si el tab actual permite eliminar
   */
  canDelete(): boolean {
    return this.getCurrentTab().hasDelete;
  }

  // ============= MÉTODOS DE UTILIDAD =============

  /**
   * Refrescar datos del tab actual
   */
  refreshCurrentTab(): void {
    // Este método será llamado por los componentes hijos
    // para notificar cambios en los datos
  }
}
