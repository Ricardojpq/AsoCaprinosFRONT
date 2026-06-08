# Plan de Refactorización Frontend - Componente Animals

## 📊 Análisis del Componente Actual

**Archivo**: `animals.ts` (1215 líneas)

### Responsabilidades Identificadas:
1. **Listado de animales** (tabla con paginación, ordenamiento, filtros)
2. **Formulario de creación/edición** (60+ campos)
3. **Selección de finca criadora**
4. **Selección de finca propietaria**
5. **Selección de padre** (genealogía)
6. **Selección de madre** (genealogía)
7. **Gestión de catálogos** (razas, colores, tipos de pelo)
8. **Búsqueda global** con debounce
9. **Validaciones de formulario**
10. **Operaciones CRUD** (crear, leer, actualizar, eliminar)

## 🎯 Estrategia de División

### Fase 1: Componentes de Presentación (Dumb Components)

#### 1. `animal-list.component.ts`
**Responsabilidad**: Mostrar tabla de animales con paginación
- **Input**: 
  - `animals: AnimalDto[]`
  - `totalRecords: number`
  - `loading: boolean`
  - `page: number`
  - `perPage: number`
  - `sortField: string`
  - `sortOrder: 'asc' | 'desc'`
- **Output**:
  - `onEdit: EventEmitter<AnimalDto>`
  - `onDelete: EventEmitter<AnimalDto>`
  - `onPageChange: EventEmitter<PageEvent>`
  - `onSort: EventEmitter<SortEvent>`
  - `onSearch: EventEmitter<string>`
- **Tamaño estimado**: ~150 líneas

#### 2. `animal-form.component.ts`
**Responsabilidad**: Formulario de creación/edición
- **Input**:
  - `animal: AnimalDto | null`
  - `isEditMode: boolean`
  - `catalogOptions: CatalogOptions` (razas, colores, etc.)
- **Output**:
  - `onSave: EventEmitter<AnimalCreateDto | AnimalUpdateDto>`
  - `onCancel: EventEmitter<void>`
  - `onSelectCriador: EventEmitter<void>`
  - `onSelectPropietario: EventEmitter<void>`
  - `onSelectPadre: EventEmitter<void>`
  - `onSelectMadre: EventEmitter<void>`
- **Tamaño estimado**: ~400 líneas

#### 3. `animal-filters.component.ts`
**Responsabilidad**: Barra de filtros avanzados
- **Input**:
  - `filters: AnimalFilters`
  - `catalogOptions: CatalogOptions`
- **Output**:
  - `onFilterChange: EventEmitter<AnimalFilters>`
  - `onClearFilters: EventEmitter<void>`
- **Tamaño estimado**: ~100 líneas

#### 4. `animal-toolbar.component.ts`
**Responsabilidad**: Barra de herramientas (botón nuevo, búsqueda)
- **Input**:
  - `searchValue: string`
- **Output**:
  - `onNew: EventEmitter<void>`
  - `onSearch: EventEmitter<string>`
- **Tamaño estimado**: ~50 líneas

### Fase 2: Componente Contenedor (Smart Component)

#### 5. `animals-container.component.ts`
**Responsabilidad**: Orquestar todos los componentes hijos
- Gestiona el estado
- Llama a los servicios
- Coordina la comunicación entre componentes
- **Tamaño estimado**: ~300 líneas

### Fase 3: State Management con Signals

#### 6. `animals.state.ts`
**Responsabilidad**: Estado centralizado con Angular Signals
```typescript
export class AnimalsState {
  // Signals
  animals = signal<AnimalDto[]>([]);
  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);
  filters = signal<AnimalFilters>({});
  selectedAnimal = signal<AnimalDto | null>(null);
  
  // Computed signals
  hasAnimals = computed(() => this.animals().length > 0);
  filteredCount = computed(() => this.animals().length);
}
```
- **Tamaño estimado**: ~150 líneas

## 📁 Estructura de Archivos Propuesta

```
animals/
├── components/
│   ├── animal-list/
│   │   ├── animal-list.component.ts
│   │   ├── animal-list.component.html
│   │   └── animal-list.component.css
│   ├── animal-form/
│   │   ├── animal-form.component.ts
│   │   ├── animal-form.component.html
│   │   ├── animal-form.component.css
│   │   └── sections/
│   │       ├── basic-info-section.component.ts
│   │       ├── genealogy-section.component.ts
│   │       ├── weights-section.component.ts
│   │       └── additional-info-section.component.ts
│   ├── animal-filters/
│   │   ├── animal-filters.component.ts
│   │   ├── animal-filters.component.html
│   │   └── animal-filters.component.css
│   ├── animal-toolbar/
│   │   ├── animal-toolbar.component.ts
│   │   ├── animal-toolbar.component.html
│   │   └── animal-toolbar.component.css
│   ├── animal-selection-table/ (ya existe)
│   └── farms-table/ (ya existe)
├── containers/
│   ├── animals-container.component.ts
│   ├── animals-container.component.html
│   └── animals-container.component.css
├── state/
│   ├── animals.state.ts
│   └── animals.actions.ts
├── models/
│   ├── DTOs/ (ya existe)
│   └── interfaces/
│       ├── animal-filters.interface.ts
│       ├── catalog-options.interface.ts
│       └── page-event.interface.ts
├── services/
│   └── animals-service.ts (ya existe)
└── animals.routes.ts
```

## 🔄 Plan de Implementación

### Paso 1: Crear Interfaces y Tipos
- [ ] `animal-filters.interface.ts`
- [ ] `catalog-options.interface.ts`
- [ ] `page-event.interface.ts`
- [ ] `sort-event.interface.ts`

### Paso 2: Crear State Management
- [ ] `animals.state.ts` con Signals
- [ ] `animals.actions.ts` (opcional, para acciones complejas)

### Paso 3: Crear Componentes de Presentación
- [ ] `animal-toolbar.component.ts` (más simple)
- [ ] `animal-filters.component.ts`
- [ ] `animal-list.component.ts`
- [ ] `animal-form.component.ts` (más complejo)
  - [ ] Dividir en secciones si es necesario

### Paso 4: Crear Componente Contenedor
- [ ] `animals-container.component.ts`
- [ ] Integrar todos los componentes hijos
- [ ] Conectar con el state

### Paso 5: Actualizar Routing
- [ ] Actualizar `animals.routes.ts` para usar el nuevo container

### Paso 6: Testing y Validación
- [ ] Probar flujo completo de CRUD
- [ ] Verificar que no se rompió funcionalidad
- [ ] Validar performance

## 📈 Beneficios Esperados

### Mantenibilidad
- ✅ Componentes de 50-400 líneas vs 1215 líneas
- ✅ Responsabilidad única por componente
- ✅ Más fácil de entender y modificar

### Reusabilidad
- ✅ `animal-list` puede usarse en otros módulos
- ✅ `animal-form` puede reutilizarse
- ✅ Componentes de sección independientes

### Testabilidad
- ✅ Componentes dumb fáciles de testear
- ✅ State aislado y testeable
- ✅ Mocking simplificado

### Performance
- ✅ Change Detection optimizado con OnPush
- ✅ Signals para reactividad eficiente
- ✅ Lazy loading de secciones del formulario

### Developer Experience
- ✅ Código más legible
- ✅ Menos merge conflicts
- ✅ Onboarding más rápido para nuevos devs

## 🎨 Patrón de Diseño: Container/Presentational

### Presentational Components (Dumb)
- No tienen dependencias de servicios
- Reciben datos vía `@Input()`
- Emiten eventos vía `@Output()`
- Usan `ChangeDetectionStrategy.OnPush`
- Enfocados en UI

### Container Components (Smart)
- Inyectan servicios
- Gestionan estado
- Coordinan componentes hijos
- Manejan lógica de negocio
- Enfocados en comportamiento

## 🚀 Orden de Ejecución

1. ✅ **Crear interfaces** (base para todo)
2. ✅ **Crear state con Signals** (gestión de datos)
3. ✅ **Crear animal-toolbar** (componente simple para probar patrón)
4. ✅ **Crear animal-list** (componente medio)
5. ✅ **Crear animal-form** (componente complejo)
6. ✅ **Crear animals-container** (orquestador)
7. ✅ **Migrar routing**
8. ✅ **Testing y validación**

---

**Tiempo estimado**: 4-6 horas de desarrollo
**Complejidad**: Media-Alta
**Impacto**: Alto (mejora significativa en mantenibilidad)
