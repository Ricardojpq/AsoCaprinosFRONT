/**
 * Factories de datos para tests
 * Crean objetos mock con valores por defecto, permitiendo overrides
 */

export interface MockApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =====================================================
// Helper: Crear respuesta API Laravel
// =====================================================
export function createMockApiResponse<T>(data: T, message = 'Success', success = true): MockApiResponse<T> {
  return {
    success,
    message,
    data
  };
}

// =====================================================
// Fincas
// =====================================================
export interface MockFarm {
  cod_finca: number;
  cod_empresa: number;
  direccion: string;
  nomb_finca: string;
  estatus_finca: string;
  cod_pais?: number | null;
  cod_estado?: number | null;
  cod_municipio?: number | null;
  cod_ciudad?: number | null;
  hierro?: string | null;
}

export function createMockFarm(overrides?: Partial<MockFarm>): MockFarm {
  return {
    cod_finca: 1,
    cod_empresa: 1,
    direccion: 'Test Address 123',
    nomb_finca: 'Test Farm',
    estatus_finca: 'A',
    cod_pais: null,
    cod_estado: null,
    cod_municipio: null,
    cod_ciudad: null,
    hierro: null,
    ...overrides
  };
}

// =====================================================
// Animales
// =====================================================
export interface MockAnimal {
  cod_finca: number;
  cod_animal: number;
  nomb_animal: string;
  cod_sexo: string;
  cod_raza?: number;
  cod_color?: number;
  estatus?: string;
  fecha_nac?: string;
  cod_origen?: number;
  tipo_concep?: number;
  tipo_parto?: number;
}

export function createMockAnimal(overrides?: Partial<MockAnimal>): MockAnimal {
  return {
    cod_finca: 1,
    cod_animal: 1,
    nomb_animal: 'TEST-001',
    cod_sexo: 'M',
    cod_raza: 1,
    cod_color: 1,
    estatus: 'A',
    fecha_nac: '2024-01-01',
    ...overrides
  };
}

// =====================================================
// Usuarios
// =====================================================
export interface MockUser {
  id: number;
  nombre: string;
  email: string;
  role_id: number;
  cod_finca: number;
  activo: boolean;
}

export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: 1,
    nombre: 'Test User',
    email: 'test@example.com',
    role_id: 1,
    cod_finca: 1,
    activo: true,
    ...overrides
  };
}

// =====================================================
// Razas
// =====================================================
export interface MockBreed {
  cod_raza: number;
  des_raza: string;
  estatus: string;
}

export function createMockBreed(overrides?: Partial<MockBreed>): MockBreed {
  return {
    cod_raza: 1,
    des_raza: 'Test Breed',
    estatus: 'A',
    ...overrides
  };
}

// =====================================================
// Colores
// =====================================================
export interface MockColor {
  cod_color: number;
  des_color: string;
  estatus: string;
}

export function createMockColor(overrides?: Partial<MockColor>): MockColor {
  return {
    cod_color: 1,
    des_color: 'Test Color',
    estatus: 'A',
    ...overrides
  };
}

// =====================================================
// Tipos de Pelo
// =====================================================
export interface MockHairType {
  cod_tipo_pelo: number;
  des_tipo_pelo: string;
  estatus: string;
}

export function createMockHairType(overrides?: Partial<MockHairType>): MockHairType {
  return {
    cod_tipo_pelo: 1,
    des_tipo_pelo: 'Test Hair Type',
    estatus: 'A',
    ...overrides
  };
}

// =====================================================
// Condición Corporal
// =====================================================
export interface MockCondition {
  cod_condicion: number;
  des_condicion: string;
  estatus: string;
}

export function createMockCondition(overrides?: Partial<MockCondition>): MockCondition {
  return {
    cod_condicion: 1,
    des_condicion: 'Test Condition',
    estatus: 'A',
    ...overrides
  };
}

// =====================================================
// Socios/Personas
// =====================================================
export interface MockPerson {
  ced_persona: string;
  nomb_persona: string;
  ape_persona: string;
  estatus: string;
}

export function createMockPerson(overrides?: Partial<MockPerson>): MockPerson {
  return {
    ced_persona: '12345678',
    nomb_persona: 'John',
    ape_persona: 'Doe',
    estatus: 'A',
    ...overrides
  };
}

// =====================================================
// Clasificadores
// =====================================================
export interface MockClassifier {
  id: number;
  nombre: string;
  tipo: string;
  estatus: string;
}

export function createMockClassifier(overrides?: Partial<MockClassifier>): MockClassifier {
  return {
    id: 1,
    nombre: 'Test Classifier',
    tipo: 'TEST',
    estatus: 'A',
    ...overrides
  };
}

// =====================================================
// División Política
// =====================================================
export interface MockCountry {
  cod_pais: number;
  nomb_pais: string;
}

export function createMockCountry(overrides?: Partial<MockCountry>): MockCountry {
  return {
    cod_pais: 1,
    nomb_pais: 'Test Country',
    ...overrides
  };
}

export interface MockState {
  cod_estado: number;
  nomb_estado: string;
  cod_pais: number;
}

export function createMockState(overrides?: Partial<MockState>): MockState {
  return {
    cod_estado: 1,
    nomb_estado: 'Test State',
    cod_pais: 1,
    ...overrides
  };
}

export interface MockMunicipality {
  cod_municipio: number;
  nomb_municipio: string;
  cod_estado: number;
}

export function createMockMunicipality(overrides?: Partial<MockMunicipality>): MockMunicipality {
  return {
    cod_municipio: 1,
    nomb_municipio: 'Test Municipality',
    cod_estado: 1,
    ...overrides
  };
}

export interface MockParish {
  cod_parroquia: number;
  nomb_parroquia: string;
  cod_municipio: number;
}

export function createMockParish(overrides?: Partial<MockParish>): MockParish {
  return {
    cod_parroquia: 1,
    nomb_parroquia: 'Test Parish',
    cod_municipio: 1,
    ...overrides
  };
}

export interface MockCity {
  cod_ciudad: number;
  nomb_ciudad: string;
  cod_municipio: number;
}

export function createMockCity(overrides?: Partial<MockCity>): MockCity {
  return {
    cod_ciudad: 1,
    nomb_ciudad: 'Test City',
    cod_municipio: 1,
    ...overrides
  };
}

// =====================================================
// Certificados
// =====================================================
export interface MockCertificate {
  id: number;
  cod_finca: number;
  num_certificado: string;
  tipo_registro: string;
  fecha_emision: string;
}

export function createMockCertificate(overrides?: Partial<MockCertificate>): MockCertificate {
  return {
    id: 1,
    cod_finca: 1,
    num_certificado: 'CERT-001',
    tipo_registro: 'I',
    fecha_emision: '2024-01-01',
    ...overrides
  };
}

// =====================================================
// Temporada de Monta
// =====================================================
export interface MockMatingSeason {
  id: number;
  cod_finca: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estatus: string;
}

export function createMockMatingSeason(overrides?: Partial<MockMatingSeason>): MockMatingSeason {
  return {
    id: 1,
    cod_finca: 1,
    nombre: 'Test Season 2024',
    fecha_inicio: '2024-01-01',
    estatus: 'ACTIVA',
    ...overrides
  };
}

// =====================================================
// Parto
// =====================================================
export interface MockBirth {
  id: number;
  cod_finca: number;
  cod_animal: number;
  fecha_parto: string;
  resultado: string;
}

export function createMockBirth(overrides?: Partial<MockBirth>): MockBirth {
  return {
    id: 1,
    cod_finca: 1,
    cod_animal: 1,
    fecha_parto: '2024-01-15',
    resultado: 'EXITOSO',
    ...overrides
  };
}
