import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CriarPartidaRequest, PartidaDataService } from '../infrastructure/partida.data.service';

export const PartidasStore = signalStore(
  { providedIn: 'root' },
  withState({
    ligaId: undefined as string | undefined,
    mutationError: null as string | null
  }),
  withProps(() => ({
    _partidaDataService: inject(PartidaDataService)
  })),
  withProps((store) => ({
    // params() returning `undefined` puts the resource in 'idle' and skips the loader entirely
    // (Angular resource semantics) — wrap in an object so an unset ligaId ("show all partidas")
    // still triggers a load instead of being mistaken for "no params yet".
    _partidaListResource: rxResource({
      params: () => ({ ligaId: store.ligaId() }),
      stream: ({ params }) => store._partidaDataService.listar(params.ligaId)
    })
  })),
  withComputed((store) => ({
    partidaList: computed(() => (store._partidaListResource.hasValue() ? store._partidaListResource.value() : [])),
    loading: computed(() => store._partidaListResource.isLoading()),
    error: computed(() => store._partidaListResource.error()?.message ?? null)
  })),
  withMethods((store) => ({
    filtrarPorLiga(ligaId: string | undefined): void {
      patchState(store, { ligaId });
    },
    criar(request: CriarPartidaRequest): void {
      patchState(store, { mutationError: null });
      store._partidaDataService.criar(request).subscribe({
        next: () => store._partidaListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao criar partida' })
      });
    }
  }))
);
