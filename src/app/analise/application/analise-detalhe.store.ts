import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { AnaliseDataService, AvaliarComClaudeRequest } from '../infrastructure/analise.data.service';

export const AnaliseDetalheStore = signalStore(
  { providedIn: 'root' },
  withState({
    id: undefined as string | undefined,
    mutationError: null as string | null
  }),
  withProps(() => ({
    _analiseDataService: inject(AnaliseDataService)
  })),
  withProps((store) => ({
    _analiseResource: rxResource({
      params: () => store.id(),
      stream: ({ params }) => (params !== undefined ? store._analiseDataService.getById(params) : of(undefined))
    })
  })),
  withComputed((store) => ({
    analise: computed(() => (store._analiseResource.hasValue() ? store._analiseResource.value() : undefined)),
    loading: computed(() => store._analiseResource.isLoading()),
    error: computed(() => store._analiseResource.error()?.message ?? null)
  })),
  withMethods((store) => ({
    setId(id: string): void {
      patchState(store, { id });
    },
    avaliarComClaude(request: AvaliarComClaudeRequest): void {
      const analiseId = store.id();
      if (analiseId === undefined) {
        return;
      }
      patchState(store, { mutationError: null });
      store._analiseDataService.avaliarComClaude(analiseId, request).subscribe({
        // O endpoint retorna 200 mesmo se a chamada ao Claude falhar internamente — recarregar é
        // a única forma de saber se a decisão realmente mudou.
        next: () => store._analiseResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao avaliar com Claude' })
      });
    }
  }))
);
