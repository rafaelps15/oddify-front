import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { ApostaMultiplaDataService } from '../infrastructure/aposta-multipla.data.service';

export const MultiplaDetalheStore = signalStore(
  { providedIn: 'root' },
  withState({
    id: undefined as string | undefined,
    mutationError: null as string | null
  }),
  withProps(() => ({
    _apostaMultiplaDataService: inject(ApostaMultiplaDataService)
  })),
  withProps((store) => ({
    _multiplaResource: rxResource({
      params: () => store.id(),
      stream: ({ params }) => (params !== undefined ? store._apostaMultiplaDataService.getById(params) : of(undefined))
    })
  })),
  withComputed((store) => ({
    multipla: computed(() => (store._multiplaResource.hasValue() ? store._multiplaResource.value() : undefined)),
    loading: computed(() => store._multiplaResource.isLoading()),
    error: computed(() => store._multiplaResource.error()?.message ?? null)
  })),
  withMethods((store) => ({
    setId(id: string): void {
      patchState(store, { id });
    },
    liquidar(): void {
      const multiplaId = store.id();
      if (multiplaId === undefined) {
        return;
      }
      patchState(store, { mutationError: null });
      store._apostaMultiplaDataService.liquidar(multiplaId).subscribe({
        next: () => store._multiplaResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao liquidar múltipla' })
      });
    }
  }))
);
