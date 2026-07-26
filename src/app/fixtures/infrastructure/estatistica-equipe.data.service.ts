import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstatisticaEquipe } from '../entities/estatistica-equipe';

@Injectable({ providedIn: 'root' })
export class EstatisticaEquipeDataService {
  private http = inject(HttpClient);

  registrar(request: EstatisticaEquipe): Observable<string> {
    return this.http.post<string>('/estatisticas-de-equipe', request);
  }
}
