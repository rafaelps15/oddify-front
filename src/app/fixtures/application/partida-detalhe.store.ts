import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { PartidaDataService, RegistrarResultadoRequest } from '../infrastructure/partida.data.service';
import { CotacaoDataService, RegistrarCotacaoRequest } from '../infrastructure/cotacao.data.service';

const MINIMO_DE_JOGOS_HISTORICO = 5;

export const PartidaDetalheStore = signalStore(
  { providedIn: 'root' },
  withState({
    id: undefined as string | undefined,
    mutationError: null as string | null
  }),
  withProps(() => ({
    _partidaDataService: inject(PartidaDataService),
    _cotacaoDataService: inject(CotacaoDataService)
  })),
  withProps((store) => ({
    _partidaResource: rxResource({
      params: () => store.id(),
      stream: ({ params }) => (params !== undefined ? store._partidaDataService.getById(params) : of(undefined))
    })
  })),
  withComputed((store) => ({
    // .value() throws while the resource is in an error state — .hasValue() is the safe check,
    // and other resources below read `partida()` reactively while computing their own params, so
    // it must never throw.
    partida: computed(() => (store._partidaResource.hasValue() ? store._partidaResource.value() : undefined)),
    loading: computed(() => store._partidaResource.isLoading()),
    error: computed(() => store._partidaResource.error()?.message ?? null)
  })),
  withProps((store) => ({
    _cotacaoListResource: rxResource({
      params: () => store.id(),
      stream: ({ params }) => (params !== undefined ? store._cotacaoDataService.listarPorPartida(params) : of([]))
    }),
    _historicoCasaResource: rxResource({
      params: () => store.partida()?.equipeCasaId,
      stream: ({ params }) =>
        params !== undefined
          ? store._partidaDataService.getHistoricoRecente(params, MINIMO_DE_JOGOS_HISTORICO)
          : of(undefined)
    }),
    _historicoVisitanteResource: rxResource({
      params: () => store.partida()?.equipeVisitanteId,
      stream: ({ params }) =>
        params !== undefined
          ? store._partidaDataService.getHistoricoRecente(params, MINIMO_DE_JOGOS_HISTORICO)
          : of(undefined)
    })
  })),
  withComputed((store) => ({
    cotacaoList: computed(() => (store._cotacaoListResource.hasValue() ? store._cotacaoListResource.value() : [])),
    historicoCasa: computed(() =>
      store._historicoCasaResource.hasValue() ? store._historicoCasaResource.value() : undefined
    ),
    historicoVisitante: computed(() =>
      store._historicoVisitanteResource.hasValue() ? store._historicoVisitanteResource.value() : undefined
    )
  })),
  withMethods((store) => ({
    setId(id: string): void {
      patchState(store, { id });
    },
    registrarCotacao(request: Omit<RegistrarCotacaoRequest, 'partidaId'>): void {
      const partidaId = store.id();
      if (partidaId === undefined) {
        return;
      }
      patchState(store, { mutationError: null });
      store._cotacaoDataService.registrar({ ...request, partidaId }).subscribe({
        next: () => store._cotacaoListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao registrar cotação' })
      });
    },
    reagendar(novaDataUtc: string): void {
      const partidaId = store.id();
      if (partidaId === undefined) {
        return;
      }
      patchState(store, { mutationError: null });
      store._partidaDataService.reagendar(partidaId, novaDataUtc).subscribe({
        next: () => store._partidaResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao reagendar partida' })
      });
    },
    registrarResultado(request: RegistrarResultadoRequest): void {
      const partidaId = store.id();
      if (partidaId === undefined) {
        return;
      }
      patchState(store, { mutationError: null });
      store._partidaDataService.registrarResultado(partidaId, request).subscribe({
        next: () => store._partidaResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao registrar resultado' })
      });
    }
  }))
);
