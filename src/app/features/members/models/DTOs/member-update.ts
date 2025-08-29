export interface MemberUpdateDto {
  estatus_socio?: 'A' | 'I';
  
  // Datos de la persona para actualizar
  persona?: {
    nom_persona?: string;
    ape_persona?: string;
    dir_persona?: string;
    tel_persona?: string;
    email_persona?: string;
    fec_nacim?: string;
    sexo_persona?: 'M' | 'F';
  };
}
