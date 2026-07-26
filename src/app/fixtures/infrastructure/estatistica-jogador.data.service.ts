import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstatisticaJogador } from '../entities/estatistica-jogador';

@Injectable({ providedIn: 'root' })
export class EstatisticaJogadorDataService {
  private http = inject(HttpClient);

  registrar(request: EstatisticaJogador): Observable<string> {
    return this.http.post<string>('/estatisticas-de-jogador', request);
  }
}
