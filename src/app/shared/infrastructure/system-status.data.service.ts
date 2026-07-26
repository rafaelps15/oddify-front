import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HealthCheckResponse } from '../entities/system-status';

@Injectable({ providedIn: 'root' })
export class SystemStatusDataService {
  private http = inject(HttpClient);

  getHealth(): Observable<HealthCheckResponse> {
    return this.http.get<HealthCheckResponse>('/health');
  }
}
