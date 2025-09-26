export enum PurezaSangreEnum {
  PO = 'O',
  PCOC = 'C',
  PR = 'T',
  BASE = 'B',
  G1 = 1,
  G2 = 2,
  G3 = 3,
  G4 = 4,
}

export const PurezaSangreLabels: Record<string | number, string> = {
  [PurezaSangreEnum.PO]: 'Puro Original (PO)',
  [PurezaSangreEnum.PCOC]: 'Puro por Cruzamiento Orientado y Controlado (PCOC)',
  [PurezaSangreEnum.PR]: 'Puro por Registro (PR)',
  [PurezaSangreEnum.BASE]: 'Base',
  [PurezaSangreEnum.G1]: 'Generación 1 (G1)',
  [PurezaSangreEnum.G2]: 'Generación 2 (G2)',
  [PurezaSangreEnum.G3]: 'Generación 3 (G3)',
  [PurezaSangreEnum.G4]: 'Generación 4 (G4)',
};
