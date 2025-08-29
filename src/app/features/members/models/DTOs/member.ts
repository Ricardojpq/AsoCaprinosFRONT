export interface MemberDto {
  ced_socio: string;
  estatus_socio: 'A' | 'I';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  
  // Información de la persona asociada (cuando se incluye en la respuesta)
  persona?: {
    ced_persona: string;
    nom_persona: string;
    ape_persona: string;
    dir_persona?: string;
    tel_persona?: string;
    email_persona?: string;
    fec_nacim?: string;
    sexo_persona?: 'M' | 'F';
    created_at?: string;
    updated_at?: string;
  };
}
