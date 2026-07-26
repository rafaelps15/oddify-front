import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cotacao } from '../entities/cotacao';

export interface RegistrarCotacaoRequest {
  partidaId: string;
  mercado: string;
  odd: number;
  casa: string;
  coletadaEmUtc: string;
}

@Injectable({ providedIn: 'root' })
export class CotacaoDataService {
  private http = inject(HttpClient);

  registrar(request: RegistrarCotacaoRequest): Observable<string> {
    return this.http.post<string>('/cotacoes', request);
  }

  listarPorPartida(partidaId: string): Observable<Cotacao[]> {
    return this.http.get<Cotacao[]>(`/partidas/${partidaId}/cotacoes`);
  }
}
