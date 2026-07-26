import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Analise } from '../entities/analise';
import { Medicao } from '../entities/medicao';

export interface AnalisarPartidaRequest {
  partidaId: string;
  mercado: string;
}

export interface AvaliarComClaudeRequest {
  contextoAdicional?: string;
}

@Injectable({ providedIn: 'root' })
export class AnaliseDataService {
  private http = inject(HttpClient);

  analisar(request: AnalisarPartidaRequest): Observable<string> {
    return this.http.post<string>('/analises/analisar', request);
  }

  avaliarComClaude(id: string, request: AvaliarComClaudeRequest): Observable<void> {
    return this.http.post<void>(`/analises/${id}/avaliar-com-claude`, request);
  }

  getById(id: string): Observable<Analise> {
    return this.http.get<Analise>(`/analises/${id}`);
  }

  getAprovadas(): Observable<Analise[]> {
    return this.http.get<Analise[]>('/analises/aprovadas');
  }

  getMedicao(): Observable<Medicao> {
    return this.http.get<Medicao>('/analises/medicao');
  }
}
