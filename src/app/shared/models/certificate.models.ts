export interface CertificateData {
  animal: {
    name: string;
    associationId: string;
    registrationNumber: string;
    sex: 'HEMBRA' | 'MACHO';
    birthDate: string; // Formato YYYY-MM-DD
    tattoos: {
      leftEar: string;
      rightEar: string;
      tailLip: string;
    };
    racialClassification: string;
    racialType: string;
    score?: number;
    coatDescription: string;
  };
  owner: PartnerInfo;
  breeder: PartnerInfo;
  genealogy: {
    father: Ancestor;
    mother: Ancestor;
    paternalGrandfather: Ancestor;
    paternalGrandmother: Ancestor;
    maternalGrandfather: Ancestor;
    maternalGrandmother: Ancestor;
  };
  issueDate: string; // Fecha de emisión del certificado
  classifier: {
    name: string;
    id: string;
  };
}

export interface PartnerInfo {
  id: string;
  name: string;
  farmName: string;
  address: string;
}

export interface Ancestor {
  name: string;
  associationId?: string;
  internationalId?: string;
  tattoos?: string;
}