# Certificate Component

Este componente implementa un certificado de registro genealógico para la Asociación de Criadores de Cabras Lecheras usando Angular 20 y las mejores prácticas del framework.

## Características

- ✅ **Angular 20**: Utiliza las últimas características incluyendo:
  - Standalone components
  - Input signals (`input.required()`, `input()`)
  - Computed signals (`computed()`)
  - Nueva sintaxis de control flow (`@if`, `@for`)
  - Signal-based reactive programming

- ✅ **Tailwind CSS**: Estilos completamente responsive y optimizados
- ✅ **TypeScript**: Interfaces tipadas para todos los datos
- ✅ **Impresión**: Optimizado para impresión con estilos específicos
- ✅ **Responsive**: Se adapta a diferentes tamaños de pantalla
- ✅ **Accesibilidad**: Cumple con estándares de accesibilidad

## Uso

### Importación
```typescript
import { CertificateComponent } from '@features/certificate';
```

### En el template
```html
<app-certificate 
  [certificateData]="certificateData"
  [showBackgroundImage]="true">
</app-certificate>
```

### Datos requeridos
El componente requiere un objeto `CertificateData` con toda la información del animal, propietario, criador y genealogía.

## Configuración de Imagen de Fondo

Para usar la imagen de fondo del certificado:

1. Coloca el archivo `certificadoBase-1.jpg` en `/src/app/assets/images/`
2. El componente automáticamente la usará como fondo con opacidad reducida

## Demo

Visita `/Certificate-Demo` para ver el componente en acción con datos de ejemplo.

## Funcionalidades

- **Impresión**: Botón para imprimir el certificado
- **Descarga**: Funcionalidad para descargar (pendiente de implementación)
- **Modo Responsive**: Se adapta a diferentes dispositivos
- **Fondo Opcional**: Se puede mostrar u ocultar la imagen de fondo

## Estructura de Archivos

```
certificate/
├── certificate.component.ts      # Componente principal
├── certificate.component.html    # Template del certificado
├── certificate.component.css     # Estilos específicos
├── certificate-demo.component.ts # Componente de demostración
├── index.ts                      # Exports del módulo
└── README.md                     # Esta documentación
```

## Mejores Prácticas Implementadas

1. **Standalone Components**: No requiere módulos adicionales
2. **Signal-based Architecture**: Reactive programming moderno
3. **Type Safety**: Interfaces TypeScript completas
4. **Performance**: Computed signals para cálculos reactivos
5. **Accessibility**: Elementos semánticamente correctos
6. **Print Optimization**: CSS específico para impresión
7. **Responsive Design**: Mobile-first approach