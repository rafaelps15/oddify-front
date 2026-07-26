import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipe } from '../entities/equipe';

export interface CriarEquipeRequest {
  idExterno: string;
  nome: string;
  ligaId: string;
}

@Injectable({ providedIn: 'root' })
export class EquipeDataService {
  private http = inject(HttpClient);

  criar(request: CriarEquipeRequest): Observable<string> {
    return this.http.post<string>('/equipes', request);
  }

  getById(id: string): Observable<Equipe> {
    return this.http.get<Equipe>(`/equipes/${id}`);
  }

  listarPorLiga(ligaId: string): Observable<Equipe[]> {
    return this.http.get<Equipe[]>('/equipes', { params: { ligaId } });
  }

  renomear(id: string, nome: string): Observable<void> {
    return this.http.put<void>(`/equipes/${id}/renomear`, { nome });
  }
}
