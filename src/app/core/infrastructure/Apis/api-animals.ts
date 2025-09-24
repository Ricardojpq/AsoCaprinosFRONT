import { environment } from '@environments/environment';

export class ApiAnimals {
  static AddAnimal(baseUrl: string) {
    return `${baseUrl}${environment.apiPrefix}/${environment.apiVersion}/animals`;
  }

  static GetAnimals(baseUrl: string, params: string = '') {
    return `${baseUrl}${environment.apiPrefix}/${environment.apiVersion}/animals${params ? '?' + params : ''}`;
  }

  static GetAnimalById(baseUrl: string, cod_finca: string, cod_animal: number) {
    return `${baseUrl}${environment.apiPrefix}/${environment.apiVersion}/animals/${cod_finca}/${cod_animal}`;
  }

  static UpdateAnimal(baseUrl: string, cod_finca: string, cod_animal: string) {
    return `${baseUrl}${environment.apiPrefix}/${environment.apiVersion}/animals/${cod_finca}/${cod_animal}`;
  }

  static DeleteAnimal(baseUrl: string, cod_finca: string, cod_animal: string) {
    return `${baseUrl}${environment.apiPrefix}/${environment.apiVersion}/animals/${cod_finca}/${cod_animal}`;
  }
} 