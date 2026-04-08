export enum BloodlinePurityEnum {
  PO = 'O',
  PCOC = 'C',
  PR = 'T',
  BASE = 'B',
  G1 = 1,
  G2 = 2,
  G3 = 3,
  G4 = 4,
}

export const BloodlinePurityLabels: Record<string | number, string> = {
  [BloodlinePurityEnum.PO]: 'Puro Original (PO)',
  [BloodlinePurityEnum.PCOC]: 'Puro por Cruce de Origen Conocido (PCOC)',
  [BloodlinePurityEnum.PR]: 'Puro por Registro (PR)',
  [BloodlinePurityEnum.BASE]: 'Rebaño Base',
  [BloodlinePurityEnum.G1]: 'Generación 1 (G1)',
  [BloodlinePurityEnum.G2]: 'Generación 2 (G2)',
  [BloodlinePurityEnum.G3]: 'Generación 3 (G3)',
  [BloodlinePurityEnum.G4]: 'Generación 4 (G4)',
};
