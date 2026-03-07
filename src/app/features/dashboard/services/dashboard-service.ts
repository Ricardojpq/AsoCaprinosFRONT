import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AnimalsService } from '@features/animals/services/animals-service';
import { AnimalDto } from '@features/animals/models/DTOs/animal';
import { SexoAnimalEnum } from '@core/enums/sexo-animal-enum';
import { PurezaSangreEnum, PurezaSangreLabels } from '@core/enums/pureza-sangre-enum';

export interface SexStats {
  label: string;
  value: string;
  count: number;
  percentage: number;
  color: string;
}

export interface BreedStats {
  label: string;
  value: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PurityStats {
  label: string;
  value: string | number;
  count: number;
  percentage: number;
  color: string;
}

export interface DashboardStats {
  totalAnimals: number;
  sexStats: SexStats[];
  breedStats: BreedStats[];
  purityStats: PurityStats[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  private readonly sexColors = ['#D4A574', '#8B6914']; // Golden theme colors
  private readonly breedColors = ['#D4A574', '#B8860B', '#8B6914', '#CD853F', '#DEB887', '#F4A460', '#DAA520', '#B8860B'];
  private readonly purityColors = ['#D4A574', '#B8860B', '#8B6914', '#CD853F', '#DEB887', '#F4A460', '#DAA520', '#B8860B'];

  constructor(private animalsService: AnimalsService) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.animalsService.getAnimalStats$().pipe(
      map((response: any) => {
        const data = response.data;
        
        return {
          totalAnimals: data.total || 0,
          sexStats: this.processSexStatsFromObject(data.por_sexo),
          breedStats: this.processBreedStatsFromArray(data.por_raza),
          purityStats: this.processPurityStatsFromObject(data.por_pureza)
        };
      }),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        return of({
          totalAnimals: 0,
          sexStats: [],
          breedStats: [],
          purityStats: []
        });
      })
    );
  }

  // Métodos para procesar la estructura real del backend
  private processSexStatsFromObject(sexStats: any): SexStats[] {
    if (!sexStats || typeof sexStats !== 'object') {
      return [];
    }
    
    const total = Object.values(sexStats).reduce((sum: number, count: any) => sum + count, 0);
    
    return Object.entries(sexStats).map(([sexo, count], index) => ({
      label: sexo === 'M' ? 'Machos' : sexo === 'H' ? 'Hembras' : `Sexo ${sexo}`,
      value: sexo,
      count: count as number,
      percentage: total > 0 ? ((count as number / total) * 100) : 0,
      color: this.sexColors[index % this.sexColors.length]
    }));
  }

  private processBreedStatsFromArray(breedStats: any[] | undefined | null): BreedStats[] {
    if (!breedStats || !Array.isArray(breedStats)) {
      return [];
    }
    
    const total = breedStats.reduce((sum, stat) => sum + stat.count, 0);
    
    return breedStats.map((stat, index) => ({
      label: stat.descripcion || `Raza ${stat.cod_raza}`,
      value: stat.cod_raza,
      count: stat.count,
      percentage: total > 0 ? ((stat.count / total) * 100) : 0,
      color: this.breedColors[index % this.breedColors.length]
    }));
  }

  private processPurityStatsFromObject(purityStats: any): PurityStats[] {
    if (!purityStats || typeof purityStats !== 'object') {
      return [];
    }
    
    const total = Object.values(purityStats).reduce((sum: number, count: any) => sum + count, 0);
    
    return Object.entries(purityStats).map(([pureza, count], index) => ({
      label: PurezaSangreLabels[pureza] || `Pureza ${pureza}`,
      value: pureza,
      count: count as number,
      percentage: total > 0 ? ((count as number / total) * 100) : 0,
      color: this.purityColors[index % this.purityColors.length]
    }));
  }

  // Métodos legacy (mantener por compatibilidad)
  private processSexStats(sexStats: any[] | undefined | null): SexStats[] {
    if (!sexStats || !Array.isArray(sexStats)) {
      return [];
    }
    return sexStats.map((stat, index) => ({
      label: stat.sexo === 'M' ? 'Machos' : stat.sexo === 'H' ? 'Hembras' : `Sexo ${stat.sexo}`,
      value: stat.sexo,
      count: stat.count,
      percentage: stat.percentage,
      color: this.sexColors[index % this.sexColors.length]
    }));
  }

  private processBreedStats(breedStats: any[] | undefined | null): BreedStats[] {
    if (!breedStats || !Array.isArray(breedStats)) {
      return [];
    }
    return breedStats.map((stat, index) => ({
      label: stat.raza,
      value: stat.raza,
      count: stat.count,
      percentage: stat.percentage,
      color: this.breedColors[index % this.breedColors.length]
    }));
  }

  private processPurityStats(purityStats: any[] | undefined | null): PurityStats[] {
    if (!purityStats || !Array.isArray(purityStats)) {
      return [];
    }
    return purityStats.map((stat, index) => ({
      label: PurezaSangreLabels[stat.pureza] || `Pureza ${stat.pureza}`,
      value: stat.pureza,
      count: stat.count,
      percentage: stat.percentage,
      color: this.purityColors[index % this.purityColors.length]
    }));
  }

  private calculateSexStats(animals: AnimalDto[]): SexStats[] {
    const sexCounts = animals.reduce((acc, animal) => {
      const sex = animal.sexo_animal;
      acc[sex] = (acc[sex] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = animals.length;
    const stats: SexStats[] = [];

    Object.entries(sexCounts).forEach(([sex, count], index) => {
      const label = sex === SexoAnimalEnum.Macho ? 'Machos' : 
                   sex === SexoAnimalEnum.Hembra ? 'Hembras' : 
                   `Sexo ${sex}`;
      
      stats.push({
        label,
        value: sex,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: this.sexColors[index % this.sexColors.length]
      });
    });

    return stats.sort((a, b) => b.count - a.count);
  }

  private calculateBreedStats(animals: AnimalDto[]): BreedStats[] {
    const breedCounts = animals.reduce((acc, animal) => {
      const breed = animal.raza?.nomb_raza || animal.raza?.descripcion || 'Sin Raza';
      acc[breed] = (acc[breed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = animals.length;
    const stats: BreedStats[] = [];

    Object.entries(breedCounts).forEach(([breed, count], index) => {
      stats.push({
        label: breed,
        value: breed,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: this.breedColors[index % this.breedColors.length]
      });
    });

    return stats.sort((a, b) => b.count - a.count);
  }

  private calculatePurityStats(animals: AnimalDto[]): PurityStats[] {
    const purityCounts = animals.reduce((acc, animal) => {
      const purity = animal.comp_racial || animal.p_sangre || 'Sin Definir';
      acc[purity] = (acc[purity] || 0) + 1;
      return acc;
    }, {} as Record<string | number, number>);

    const total = animals.length;
    const stats: PurityStats[] = [];

    Object.entries(purityCounts).forEach(([purity, count], index) => {
      const label = PurezaSangreLabels[purity] || `Pureza ${purity}`;
      
      stats.push({
        label,
        value: purity,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: this.purityColors[index % this.purityColors.length]
      });
    });

    return stats.sort((a, b) => b.count - a.count);
  }
}
