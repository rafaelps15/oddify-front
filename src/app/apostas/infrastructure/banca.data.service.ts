import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banca } from '../entities/banca';

export interface CriarBancaRequest {
  saldoInicial: number;
  modoPaperTrading: boolean;
}

@Injectable({ providedIn: 'root' })
export class BancaDataService {
  private http = inject(HttpClient);

  criar(request: CriarBancaRequest): Observable<string> {
    return this.http.post<string>('/bancas', request);
  }

  getById(id: string): Observable<Banca> {
    return this.http.get<Banca>(`/bancas/${id}`);
  }
}
