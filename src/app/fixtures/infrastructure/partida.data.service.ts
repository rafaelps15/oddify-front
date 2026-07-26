import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoricoDeEquipe, Partida } from '../entities/partida';

export interface CriarPartidaRequest {
  idExterno: string;
  ligaId: string;
  equipeCasaId: string;
  equipeVisitanteId: string;
  dataUtc: string;
}

export interface RegistrarResultadoRequest {
  golsCasa: number;
  golsVisitante: number;
}

@Injectable({ providedIn: 'root' })
export class PartidaDataService {
  private http = inject(HttpClient);

  criar(request: CriarPartidaRequest): Observable<string> {
    return this.http.post<string>('/partidas', request);
  }

  getById(id: string): Observable<Partida> {
    return this.http.get<Partida>(`/partidas/${id}`);
  }

  listar(ligaId?: string): Observable<Partida[]> {
    return this.http.get<Partida[]>('/partidas', { params: ligaId ? { ligaId } : {} });
  }

  reagendar(id: string, novaDataUtc: string): Observable<void> {
    return this.http.put<void>(`/partidas/${id}/reagendar`, { novaDataUtc });
  }

  registrarResultado(id: string, request: RegistrarResultadoRequest): Observable<void> {
    return this.http.put<void>(`/partidas/${id}/registrar-resultado`, request);
  }

  getHistoricoRecente(equipeId: string, minimoDeJogos: number): Observable<HistoricoDeEquipe> {
    return this.http.get<HistoricoDeEquipe>(`/equipes/${equipeId}/historico-recente`, {
      params: { minimoDeJogos }
    });
  }
}
