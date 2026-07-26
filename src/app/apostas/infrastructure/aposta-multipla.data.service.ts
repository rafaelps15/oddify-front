import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApostaMultipla } from '../entities/aposta-multipla';
import { Roi } from '../entities/roi';

export interface MontarMultiplaRequest {
  bancaId: string;
  analiseIds: string[];
}

@Injectable({ providedIn: 'root' })
export class ApostaMultiplaDataService {
  private http = inject(HttpClient);

  getById(id: string): Observable<ApostaMultipla> {
    return this.http.get<ApostaMultipla>(`/apostas-multiplas/${id}`);
  }

  listar(bancaId?: string): Observable<ApostaMultipla[]> {
    return this.http.get<ApostaMultipla[]>('/apostas-multiplas', { params: bancaId ? { bancaId } : {} });
  }

  getRoi(bancaId?: string): Observable<Roi> {
    return this.http.get<Roi>('/apostas-multiplas/roi', { params: bancaId ? { bancaId } : {} });
  }

  montar(request: MontarMultiplaRequest): Observable<string> {
    return this.http.post<string>('/apostas-multiplas/montar', request);
  }

  liquidar(id: string): Observable<void> {
    return this.http.post<void>(`/apostas-multiplas/${id}/liquidar`, {});
  }
}
