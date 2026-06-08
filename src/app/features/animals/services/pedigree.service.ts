import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PedigreeNode, UpdateInbreedingPayload } from '../models/interfaces/pedigree.interface';

@Injectable({ providedIn: 'root' })
export class PedigreeService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/animals`;

  getById$(id: number, depth = 3): Observable<PedigreeNode> {
    return this.http
      .get<{ data: PedigreeNode }>(`${this.base}/${id}/pedigree?depth=${depth}`)
      .pipe(map(r => r.data));
  }

  getByCode$(codFinca: number, codAnimal: string, depth = 3): Observable<PedigreeNode> {
    return this.http
      .get<{ data: PedigreeNode }>(
        `${this.base}/pedigree?cod_finca=${codFinca}&cod_animal=${encodeURIComponent(codAnimal)}&depth=${depth}`
      )
      .pipe(map(r => r.data));
  }

  expandNode$(codFinca: number, codAnimal: string, depth = 3): Observable<PedigreeNode> {
    return this.http
      .get<{ data: PedigreeNode }>(
        `${this.base}/pedigree/subtree?cod_finca=${codFinca}&cod_animal=${encodeURIComponent(codAnimal)}&depth=${depth}`
      )
      .pipe(map(r => r.data));
  }

  updateInbreeding$(
    codFinca: number,
    codAnimal: string,
    payload: UpdateInbreedingPayload
  ): Observable<{ cod_finca: number; cod_animal: string; coef_consanguinidad: number }> {
    return this.http
      .patch<{ data: { cod_finca: number; cod_animal: string; coef_consanguinidad: number } }>(
        `${this.base}/${codFinca}/${encodeURIComponent(codAnimal)}/inbreeding`,
        payload
      )
      .pipe(map(r => r.data));
  }
}
