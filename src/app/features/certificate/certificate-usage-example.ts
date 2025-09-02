// Example de uso del componente Certificate
// Usage example for the Certificate component

import { Component } from '@angular/core';
import { CertificateComponent, CertificateData } from '@features/certificate';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CertificateComponent],
  template: `
    <!-- Uso básico del componente -->
    <app-certificate 
      [certificateData]="myCertificateData"
      [showBackgroundImage]="true">
    </app-certificate>
    
    <!-- Sin imagen de fondo -->
    <app-certificate 
      [certificateData]="myCertificateData"
      [showBackgroundImage]="false">
    </app-certificate>
  `
})
export class ExampleUsageComponent {
  
  myCertificateData: CertificateData = {
    animal: {
      name: 'NOMBRE_DEL_ANIMAL',
      associationId: 'CODIGO_ASOCIACION',
      registrationNumber: 'NUMERO_REGISTRO',
      sex: 'HEMBRA', // o 'MACHO'
      birthDate: '2023-01-15', // Formato YYYY-MM-DD
      tattoos: {
        leftEar: 'TATUAJE_IZQUIERDO',
        rightEar: 'TATUAJE_DERECHO',
        tailLip: 'TATUAJE_COLA_LABIO'
      },
      racialClassification: 'ALPINA',
      racialType: 'A5(50% A)',
      score: 85, // Opcional
      coatDescription: 'Descripción del pelaje del animal'
    },
    owner: {
      id: 'ID_PROPIETARIO',
      name: 'NOMBRE_PROPIETARIO',
      farmName: 'NOMBRE_FINCA',
      address: 'DIRECCIÓN_COMPLETA'
    },
    breeder: {
      id: 'ID_CRIADOR',
      name: 'NOMBRE_CRIADOR',
      farmName: 'NOMBRE_FINCA_CRIADOR',
      address: 'DIRECCIÓN_CRIADOR'
    },
    genealogy: {
      father: {
        name: 'NOMBRE_PADRE',
        associationId: 'ID_ASOCIACION_PADRE',
        internationalId: 'ID_INTERNACIONAL_PADRE'
      },
      mother: {
        name: 'NOMBRE_MADRE',
        associationId: 'ID_ASOCIACION_MADRE',
        internationalId: 'ID_INTERNACIONAL_MADRE'
      },
      paternalGrandfather: {
        name: 'ABUELO_PATERNO',
        associationId: 'ID_ABUELO_P',
        internationalId: 'ID_INT_ABUELO_P'
      },
      paternalGrandmother: {
        name: 'ABUELA_PATERNA',
        associationId: 'ID_ABUELA_P',
        internationalId: 'ID_INT_ABUELA_P'
      },
      maternalGrandfather: {
        name: 'ABUELO_MATERNO',
        associationId: 'ID_ABUELO_M',
        internationalId: 'ID_INT_ABUELO_M'
      },
      maternalGrandmother: {
        name: 'ABUELA_MATERNA',
        associationId: 'ID_ABUELA_M',
        internationalId: 'ID_INT_ABUELA_M'
      }
    },
    issueDate: '2024-03-12', // Fecha de emisión
    classifier: {
      name: 'NOMBRE_CLASIFICADOR',
      id: 'ID_CLASIFICADOR'
    }
  };
}