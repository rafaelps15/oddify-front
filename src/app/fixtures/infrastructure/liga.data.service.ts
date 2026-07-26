import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Liga } from '../entities/liga';

export interface CriarLigaRequest {
  idExterno: string;
  nome: string;
  mediaDeGols: number;
  fatorCasa: number;
}

export interface AtualizarMediasDaLigaRequest {
  mediaDeGols: number;
  fatorCasa: number;
}

@Injectable({ providedIn: 'root' })
export class LigaDataService {
  private http = inject(HttpClient);

  criar(request: CriarLigaRequest): Observable<string> {
    return this.http.post<string>('/ligas', request);
  }

  getById(id: string): Observable<Liga> {
    return this.http.get<Liga>(`/ligas/${id}`);
  }

  listar(): Observable<Liga[]> {
    return this.http.get<Liga[]>('/ligas');
  }

  atualizarMedias(id: string, request: AtualizarMediasDaLigaRequest): Observable<void> {
    return this.http.put<void>(`/ligas/${id}/atualizar-medias`, request);
  }

  calibrar(id: string): Observable<void> {
    return this.http.put<void>(`/ligas/${id}/calibrar`, {});
  }
}
