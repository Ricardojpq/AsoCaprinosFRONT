# AGENTS.md — AsoCaprinos FRONT

## Stack

- Angular 17+ standalone, signals, TailwindCSS, PrimeNG (parcial).
- Estructura: `core/` (servicios, guards, utils), `features/` (módulos), `shared/` (componentes reusables).

## Convenciones de naming

- **UI labels, components, signals, métodos:** **inglés**.
- **Modelos/DTOs/payloads que viajan al backend:** **español** (alineados a la BD).
  - Ej: `interface CreateBreedingSeasonRequest { fecha_inicio: string; macho_id: number; ... }` — el shape envía español.
- **Constantes de estado:** UPPERCASE idénticas al backend (`'CABRA'`, `'CHIVO'`, `'PREÑADA'`, etc.).

## Reproducción — reglas críticas

### Catálogo caprino

- Etapas evolutivas: `CRIA`, `CABRITO`, `CABRITA`, `CABRITON`, `CABRITONA`, `CHIVO`, `CABRA`.
- Antiguos `OVEJA/CARNERO/CORDERO/...` quedaron deprecados — no usar.

### Bug históricos resueltos (no reintroducir)

- **BUG-001:** todos los campos de observación se llaman `observaciones` (no `comments`).
- **BUG-002:** propiedad estado se llama `estado_reproduccion` (no `estado_reproduction`).
- **BUG-003:** `fecha_fin` viene del back ya calculada al crear; el front solo la sugiere editable.

### Helpers obligatorios

- `formatDateLocal(d: Date): string` para todas las queries con fechas (evitar `toISOString().split('T')[0]` por timezone).
- `calcularEdad(fec_nacim): { years, months, days }` para edad **solo en selección/edición individual** (no en listados masivos).

### Diagnóstico (DX)

- Título UI: "Diagnosis (DX)".
- Filtros: temporada (dropdown FINALIZADAS), rango fechas, búsqueda.
- Badge **read-only** del parámetro `DIAS_ESPERA_DIAGNOSTICO_PRENEZ` con tooltip "Editable in Settings".

### Partos

- Modal con sub-tabla editable de crías: sexo/peso/estado/observaciones por cría (no usar `generarCrias` automático).
- Auto-set `parto.fecha = hembra.fecha_parto_estimada` al elegir hembra (editable).

### Corrales

- Selector modal en form Animal (similar al de macho/hembra).
- Validar regla M+H solo en temporada activa antes de enviar.

## Estilo

- No agregar/quitar comentarios sin pedido.
- Tipar signals (`signal<Animal[]>`, no `any[]`).
- Componentes standalone con `imports` mínimos.
- Tailwind para layout; PrimeNG para tablas/dialogs/dropdowns.

## Agent Collaboration Rules

### Tool Responsibilities

#### ui-ux-pro-max

- **Responsible for:**
  - UX architecture
  - Information hierarchy
  - Page structure
  - User flows
  - Design system suggestions
  - Accessibility heuristics
  - Content organization
- **Must NOT:**
  - Over-polish spacing repeatedly
  - Micro-adjust visual details endlessly

#### impeccable

- **Responsible for:**
  - UI critique
  - Visual polish
  - Spacing consistency
  - Typography quality
  - Anti-pattern detection
  - Responsive fixes
  - Edge-case handling
  - Accessibility refinement
- **Must NOT:**
  - Redesign page architecture unless explicitly requested
  - Change product intent
  - Override UX decisions without justification

### Workflow

1. ui-ux-pro-max analiza y propone mejoras.
2. ui-ux-pro-max implementa los cambios aprobados.
3. impeccable revisa y critica la implementación.
4. impeccable pule la UI y endurece casos borde.
