import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { FincaDto, FincaSelectionDto } from '../../../../core/models/DTOs/finca.dto';

@Component({
  selector: 'app-farms-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToolbarModule
  ],
  templateUrl: './farms-table.component.html',
  styleUrls: ['./farms-table.component.css']
})
export class FarmsTableComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() title: string = 'Seleccionar Finca';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() fincaSelected = new EventEmitter<FincaDto>();

  farms: FincaSelectionDto[] = [];
  selectedFarm: FincaSelectionDto | null = null;
  globalFilterValue: string = '';
  totalRecords: number = 0;

  // Mock data based on the backend response structure
  mockFarms: FincaDto[] = [
    {
      cod_finca: 1,
      cod_empresa: 1,
      cod_municipio: 1,
      cod_estado: 1,
      cod_ciudad: 1,
      ide_finca: "LE",
      direccion: "Carretera Nacional Km 15",
      nomb_finca: "La Esperanza",
      tlf: "0414-1111111",
      rif: null,
      fec_inicio: "2024-01-01T00:00:00.000000Z",
      fec_actualizacion: "2025-09-13T00:00:00.000000Z",
      hierro: null,
      tipo_ganaderia: null,
      tipo_sistema: null,
      banco_semen: null,
      nro_sec_exp: null,
      dir_export: null,
      dir_import: null,
      formato_export: null,
      ced_propietario: "12345678",
      cel_propietrio: null,
      email_propietario: null,
      persona_contacto: null,
      cel_contacto: null,
      email_contacto: null,
      previa_sigmav: null,
      tipo_criador: null,
      es_socio: null,
      cod_pais: 1,
      ide_criador_externo: null,
      fec_ult_celo: null,
      fec_ult_servicio: null,
      fec_ult_diagnostico: null,
      fec_ult_parto: null,
      fec_ult_prog_monta: null,
      predio_estado: null,
      predio_municipio: null,
      predio_parroquia: null,
      abr_finca: null,
      id_criador: null,
      imagen: "finca1.jpg",
      estatus_finca: "A",
      is_active: true,
      created_by: 1,
      updated_by: null,
      is_deleted: false,
      created_at: "2025-09-13T15:26:47.000000Z",
      updated_at: null,
      deleted_at: null,
      pais: {
        cod_pais: 1,
        nom_pais: "Venezuela",
        siglas_pais: "VE",
        capital_pais: "Caracas",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:44.000000Z",
        updated_at: null,
        deleted_at: null
      },
      estado: {
        cod_estado: 1,
        nom_estado: "Amazonas",
        siglas_estado: null,
        cod_pais: 1,
        capital_estado: "Puerto Ayacucho",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:44.000000Z",
        updated_at: null,
        deleted_at: null
      },
      municipio: {
        cod_municipio: 1,
        cod_estado: 1,
        nom_municipio: "Alto Orinoco",
        capital_municipio: "La Esmeralda",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:44.000000Z",
        updated_at: null,
        deleted_at: null
      },
      ciudad: {
        cod_ciudad: 1,
        nom_ciudad: "La Esmeralda",
        estado_ciudad: "Amazonas",
        municipio_ciudad: "Alto Orinoco",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:45.000000Z",
        updated_at: null,
        deleted_at: null
      },
      propietario: {
        ced_persona: "12345678",
        cod_estado: null,
        cod_municipio: null,
        cod_ciudad: null,
        ape_persona: "Pérez",
        nom_persona: "Juan",
        nac_persona: "V",
        sexo_persona: "M",
        fnac_persona: null,
        edad_persona: null,
        tlf_persona: null,
        cel_persona: null,
        dir_persona: null,
        email_persona: null,
        foto_persona: null,
        estatus_persona: "A",
        es_socio: true,
        num_ced_e: null,
        es_veteri: null,
        es_personal: null,
        es_empleado: null,
        cod_pais: null,
        es_externo: null,
        imagen: null,
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:46.000000Z",
        updated_at: null,
        deleted_at: null
      }
    },
    {
      cod_finca: 2,
      cod_empresa: 1,
      cod_municipio: 2,
      cod_estado: 1,
      cod_ciudad: 2,
      ide_finca: "EP",
      direccion: "Sector Los Altos",
      nomb_finca: "El Paraíso",
      tlf: "0424-2222222",
      rif: null,
      fec_inicio: "2024-01-15T00:00:00.000000Z",
      fec_actualizacion: "2025-09-13T00:00:00.000000Z",
      hierro: null,
      tipo_ganaderia: null,
      tipo_sistema: null,
      banco_semen: null,
      nro_sec_exp: null,
      dir_export: null,
      dir_import: null,
      formato_export: null,
      ced_propietario: "87654321",
      cel_propietrio: null,
      email_propietario: null,
      persona_contacto: null,
      cel_contacto: null,
      email_contacto: null,
      previa_sigmav: null,
      tipo_criador: null,
      es_socio: null,
      cod_pais: 1,
      ide_criador_externo: null,
      fec_ult_celo: null,
      fec_ult_servicio: null,
      fec_ult_diagnostico: null,
      fec_ult_parto: null,
      fec_ult_prog_monta: null,
      predio_estado: null,
      predio_municipio: null,
      predio_parroquia: null,
      abr_finca: null,
      id_criador: null,
      imagen: "finca2.jpg",
      estatus_finca: "A",
      is_active: true,
      created_by: 1,
      updated_by: null,
      is_deleted: false,
      created_at: "2025-09-13T15:26:47.000000Z",
      updated_at: null,
      deleted_at: null,
      pais: {
        cod_pais: 1,
        nom_pais: "Venezuela",
        siglas_pais: "VE",
        capital_pais: "Caracas",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:44.000000Z",
        updated_at: null,
        deleted_at: null
      },
      estado: {
        cod_estado: 1,
        nom_estado: "Amazonas",
        siglas_estado: null,
        cod_pais: 1,
        capital_estado: "Puerto Ayacucho",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:44.000000Z",
        updated_at: null,
        deleted_at: null
      },
      municipio: {
        cod_municipio: 2,
        cod_estado: 1,
        nom_municipio: "Atabapo",
        capital_municipio: "San Fernando de Atabapo",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:44.000000Z",
        updated_at: null,
        deleted_at: null
      },
      ciudad: {
        cod_ciudad: 2,
        nom_ciudad: "San Fernando de Atabapo",
        estado_ciudad: "Amazonas",
        municipio_ciudad: "Atabapo",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:45.000000Z",
        updated_at: null,
        deleted_at: null
      },
      propietario: {
        ced_persona: "87654321",
        cod_estado: null,
        cod_municipio: null,
        cod_ciudad: null,
        ape_persona: "González",
        nom_persona: "María",
        nac_persona: "V",
        sexo_persona: "M",
        fnac_persona: null,
        edad_persona: null,
        tlf_persona: null,
        cel_persona: null,
        dir_persona: null,
        email_persona: null,
        foto_persona: null,
        estatus_persona: "A",
        es_socio: true,
        num_ced_e: null,
        es_veteri: null,
        es_personal: null,
        es_empleado: null,
        cod_pais: null,
        es_externo: null,
        imagen: null,
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:46.000000Z",
        updated_at: null,
        deleted_at: null
      }
    },
    // Additional mock data
    {
      cod_finca: 3,
      cod_empresa: 1,
      cod_municipio: 1,
      cod_estado: 2,
      cod_ciudad: 3,
      ide_finca: "AEC",
      direccion: "Zona Industrial Norte",
      nomb_finca: "AGROINVERSIONES EL CAFETAL",
      tlf: "0412-3333333",
      rif: "J-12345678-9",
      fec_inicio: "2023-05-10T00:00:00.000000Z",
      fec_actualizacion: "2025-09-13T00:00:00.000000Z",
      hierro: null,
      tipo_ganaderia: null,
      tipo_sistema: null,
      banco_semen: null,
      nro_sec_exp: null,
      dir_export: null,
      dir_import: null,
      formato_export: null,
      ced_propietario: "11223344",
      cel_propietrio: null,
      email_propietario: null,
      persona_contacto: null,
      cel_contacto: null,
      email_contacto: null,
      previa_sigmav: null,
      tipo_criador: null,
      es_socio: null,
      cod_pais: 1,
      ide_criador_externo: null,
      fec_ult_celo: null,
      fec_ult_servicio: null,
      fec_ult_diagnostico: null,
      fec_ult_parto: null,
      fec_ult_prog_monta: null,
      predio_estado: null,
      predio_municipio: null,
      predio_parroquia: null,
      abr_finca: null,
      id_criador: null,
      imagen: "finca3.jpg",
      estatus_finca: "A",
      is_active: true,
      created_by: 1,
      updated_by: null,
      is_deleted: false,
      created_at: "2025-09-13T15:26:47.000000Z",
      updated_at: null,
      deleted_at: null,
      pais: {
        cod_pais: 1,
        nom_pais: "Venezuela",
        siglas_pais: "VE",
        capital_pais: "Caracas",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:44.000000Z",
        updated_at: null,
        deleted_at: null
      },
      estado: {
        cod_estado: 2,
        nom_estado: "Lara",
        siglas_estado: "LA",
        cod_pais: 1,
        capital_estado: "Barquisimeto",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:44.000000Z",
        updated_at: null,
        deleted_at: null
      },
      municipio: {
        cod_municipio: 3,
        cod_estado: 2,
        nom_municipio: "Morán",
        capital_municipio: "El Tocuyo",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:44.000000Z",
        updated_at: null,
        deleted_at: null
      },
      ciudad: {
        cod_ciudad: 3,
        nom_ciudad: "Anzoátegui",
        estado_ciudad: "Lara",
        municipio_ciudad: "Morán",
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:45.000000Z",
        updated_at: null,
        deleted_at: null
      },
      propietario: {
        ced_persona: "11223344",
        cod_estado: null,
        cod_municipio: null,
        cod_ciudad: null,
        ape_persona: "Rodríguez Cubas",
        nom_persona: "Nelson José",
        nac_persona: "V",
        sexo_persona: "M",
        fnac_persona: null,
        edad_persona: null,
        tlf_persona: null,
        cel_persona: null,
        dir_persona: null,
        email_persona: null,
        foto_persona: null,
        estatus_persona: "A",
        es_socio: true,
        num_ced_e: null,
        es_veteri: null,
        es_personal: null,
        es_empleado: null,
        cod_pais: null,
        es_externo: null,
        imagen: null,
        is_active: true,
        created_by: 1,
        updated_by: null,
        is_deleted: false,
        created_at: "2025-09-13T15:26:46.000000Z",
        updated_at: null,
        deleted_at: null
      }
    }
  ];

  ngOnInit() {
    this.loadFarms();
  }

  loadFarms() {
    // Transform mock data to selection format
    this.farms = this.mockFarms.map(farm => ({
      cod_finca: farm.cod_finca,
      ide_finca: farm.ide_finca,
      nomb_finca: farm.nomb_finca,
      estado: farm.estado.nom_estado,
      municipio: farm.municipio.nom_municipio,
      ciudad: farm.ciudad.nom_ciudad,
      propietario: `${farm.propietario.nom_persona} ${farm.propietario.ape_persona}`
    }));
    this.totalRecords = this.farms.length;
  }

  onGlobalFilter(table: any, event: Event) {
    const target = event.target as HTMLInputElement;
    this.globalFilterValue = target.value;
    table.filterGlobal(target.value, 'contains');
  }

  clear(table: any) {
    table.clear();
    this.globalFilterValue = '';
  }

  onRowSelect(event: any) {
    this.selectedFarm = event.data;
  }

  onRowUnselect(event: any) {
    this.selectedFarm = null;
  }

  selectFarm() {
    if (this.selectedFarm) {
      // Find the complete farm data
      const completeFarm = this.mockFarms.find(f => f.cod_finca === this.selectedFarm!.cod_finca);
      if (completeFarm) {
        this.fincaSelected.emit(completeFarm);
        this.hideDialog();
      }
    }
  }

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.selectedFarm = null;
  }
}
