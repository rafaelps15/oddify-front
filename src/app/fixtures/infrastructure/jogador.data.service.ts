import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jogador } from '../entities/jogador';

export interface CriarJogadorRequest {
  idExterno: string;
  equipeId: string;
  nome: string;
  posicao: string;
}

@Injectable({ providedIn: 'root' })
export class JogadorDataService {
  private http = inject(HttpClient);

  criar(request: CriarJogadorRequest): Observable<string> {
    return this.http.post<string>('/jogadores', request);
  }

  getById(id: string): Observable<Jogador> {
    return this.http.get<Jogador>(`/jogadores/${id}`);
  }

  listarPorEquipe(equipeId: string): Observable<Jogador[]> {
    return this.http.get<Jogador[]>('/jogadores', { params: { equipeId } });
  }

  transferir(id: string, novaEquipeId: string): Observable<void> {
    return this.http.put<void>(`/jogadores/${id}/transferir`, { novaEquipeId });
  }
}
