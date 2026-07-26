import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AnalisarPartidaRequest, AnaliseDataService } from '../infrastructure/analise.data.service';

export const AnalisesStore = signalStore(
  { providedIn: 'root' },
  withState({ mutationError: null as string | null }),
  withProps(() => ({
    _analiseDataService: inject(AnaliseDataService)
  })),
  withProps((store) => ({
    _analiseListResource: rxResource({
      stream: () => store._analiseDataService.getAprovadas()
    })
  })),
  withComputed((store) => ({
    analiseList: computed(() => (store._analiseListResource.hasValue() ? store._analiseListResource.value() : [])),
    loading: computed(() => store._analiseListResource.isLoading()),
    error: computed(() => store._analiseListResource.error()?.message ?? null)
  })),
  withMethods((store) => ({
    analisar(request: AnalisarPartidaRequest): void {
      patchState(store, { mutationError: null });
      store._analiseDataService.analisar(request).subscribe({
        next: () => store._analiseListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao analisar partida' })
      });
    }
  }))
);
