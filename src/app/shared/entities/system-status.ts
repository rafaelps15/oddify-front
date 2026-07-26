// Shape do JSON produzido por UIResponseWriter.WriteHealthCheckUIResponse (AspNetCore.HealthChecks.UI.Client)
// no endpoint GET /health do backend.
export interface HealthCheckEntry {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  description: string | null;
}

export interface HealthCheckResponse {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  entries: Record<string, HealthCheckEntry>;
}
