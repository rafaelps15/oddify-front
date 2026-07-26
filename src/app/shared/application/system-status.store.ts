import { signalStore, withProps, withComputed } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SystemStatusDataService } from '../infrastructure/system-status.data.service';
import { HealthCheckEntry } from '../entities/system-status';

export interface StatusItem {
  label: string;
  value: string;
  ok: boolean;
  accent?: boolean;
  mock?: boolean;
}

// O backend não tem, hoje, um jeito de expor a versão do motor Poisson-Dixon-Coles nem um health
// check para a camada Claude (só há health checks para api-football/the-odds-api) — únicos 2 itens
// mockados do card de status; o resto vem de GET /health de verdade.
const ITENS_MOCK: StatusItem[] = [
  { label: 'Motor Poisson-Dixon-Coles', value: 'sem endpoint', ok: true, mock: true },
  { label: 'Camada Claude (IA)', value: 'sem health check', ok: true, accent: true, mock: true }
];

export const SystemStatusStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _systemStatusDataService: inject(SystemStatusDataService)
  })),
  withProps((store) => ({
    _healthResource: rxResource({
      stream: () => store._systemStatusDataService.getHealth()
    })
  })),
  withComputed((store) => ({
    loading: computed(() => store._healthResource.isLoading()),
    error: computed(() => store._healthResource.error()?.message ?? null),
    itens: computed((): StatusItem[] => {
      const health = store._healthResource.hasValue() ? store._healthResource.value() : undefined;
      const entries = health?.entries ?? {};

      const itemDeEntrada = (chave: string, label: string): StatusItem => {
        const entrada: HealthCheckEntry | undefined = entries[chave];
        return {
          label,
          value: entrada ? entrada.status : 'indisponível',
          ok: entrada?.status === 'Healthy'
        };
      };

      return [
        itemDeEntrada('api-football', 'API-Football'),
        itemDeEntrada('the-odds-api', 'The Odds API'),
        itemDeEntrada('npgsql', 'Postgres'),
        itemDeEntrada('redis', 'Redis'),
        ...ITENS_MOCK
      ];
    })
  }))
);
