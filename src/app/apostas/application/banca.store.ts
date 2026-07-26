import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { BancaDataService, CriarBancaRequest } from '../infrastructure/banca.data.service';

const BANCA_ATIVA_KEY = 'apostas.bancaAtivaId';

export const BancaStore = signalStore(
  { providedIn: 'root' },
  withState(() => ({
    bancaId: (localStorage.getItem(BANCA_ATIVA_KEY) ?? undefined) as string | undefined,
    mutationError: null as string | null
  })),
  withProps(() => ({
    _bancaDataService: inject(BancaDataService)
  })),
  withProps((store) => ({
    _bancaResource: rxResource({
      params: () => store.bancaId(),
      stream: ({ params }) => (params !== undefined ? store._bancaDataService.getById(params) : of(undefined))
    })
  })),
  withComputed((store) => ({
    banca: computed(() => (store._bancaResource.hasValue() ? store._bancaResource.value() : undefined)),
    temBancaConfigurada: computed(() => store.bancaId() !== undefined),
    loading: computed(() => store._bancaResource.isLoading()),
    error: computed(() => store._bancaResource.error()?.message ?? null)
  })),
  withMethods((store) => ({
    criar(request: CriarBancaRequest): void {
      patchState(store, { mutationError: null });
      store._bancaDataService.criar(request).subscribe({
        next: (id) => {
          localStorage.setItem(BANCA_ATIVA_KEY, id);
          patchState(store, { bancaId: id });
        },
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao criar banca' })
      });
    },
    usarBancaExistente(id: string): void {
      localStorage.setItem(BANCA_ATIVA_KEY, id);
      patchState(store, { bancaId: id, mutationError: null });
    },
    esquecerBanca(): void {
      localStorage.removeItem(BANCA_ATIVA_KEY);
      patchState(store, { bancaId: undefined, mutationError: null });
    }
  }))
);
