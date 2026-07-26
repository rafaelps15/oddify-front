import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApostaMultiplaDataService } from '../infrastructure/aposta-multipla.data.service';

export const ApostasMultiplasStore = signalStore(
  { providedIn: 'root' },
  withState({
    bancaId: undefined as string | undefined,
    mutationError: null as string | null
  }),
  withProps(() => ({
    _apostaMultiplaDataService: inject(ApostaMultiplaDataService)
  })),
  withProps((store) => ({
    // params() nunca deve devolver `undefined` puro quando `undefined` é um valor válido (aqui,
    // "sem filtro de banca") — sem isso o resource entraria em 'idle' e nunca carregaria.
    _apostaMultiplaListResource: rxResource({
      params: () => ({ bancaId: store.bancaId() }),
      stream: ({ params }) => store._apostaMultiplaDataService.listar(params.bancaId)
    }),
    _roiResource: rxResource({
      params: () => ({ bancaId: store.bancaId() }),
      stream: ({ params }) => store._apostaMultiplaDataService.getRoi(params.bancaId)
    })
  })),
  withComputed((store) => ({
    apostaMultiplaList: computed(() =>
      store._apostaMultiplaListResource.hasValue() ? store._apostaMultiplaListResource.value() : []
    ),
    roi: computed(() => (store._roiResource.hasValue() ? store._roiResource.value() : undefined)),
    loading: computed(() => store._apostaMultiplaListResource.isLoading() || store._roiResource.isLoading()),
    error: computed(
      () => store._apostaMultiplaListResource.error()?.message ?? store._roiResource.error()?.message ?? null
    )
  })),
  withMethods((store) => ({
    setBancaId(bancaId: string | undefined): void {
      patchState(store, { bancaId });
    },
    liquidar(id: string): void {
      patchState(store, { mutationError: null });
      store._apostaMultiplaDataService.liquidar(id).subscribe({
        next: () => {
          store._apostaMultiplaListResource.reload();
          store._roiResource.reload();
        },
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao liquidar múltipla' })
      });
    }
  }))
);
