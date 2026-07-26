import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  AtualizarMediasDaLigaRequest,
  CriarLigaRequest,
  LigaDataService
} from '../infrastructure/liga.data.service';

export const LigasStore = signalStore(
  { providedIn: 'root' },
  withState({ mutationError: null as string | null }),
  withProps(() => ({
    _ligaDataService: inject(LigaDataService)
  })),
  withProps((store) => ({
    _ligaListResource: rxResource({
      stream: () => store._ligaDataService.listar()
    })
  })),
  withComputed((store) => ({
    ligaList: computed(() => (store._ligaListResource.hasValue() ? store._ligaListResource.value() : [])),
    loading: computed(() => store._ligaListResource.isLoading()),
    error: computed(() => store._ligaListResource.error()?.message ?? null)
  })),
  withMethods((store) => ({
    criar(request: CriarLigaRequest): void {
      patchState(store, { mutationError: null });
      store._ligaDataService.criar(request).subscribe({
        next: () => store._ligaListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao criar liga' })
      });
    },
    atualizarMedias(id: string, request: AtualizarMediasDaLigaRequest): void {
      patchState(store, { mutationError: null });
      store._ligaDataService.atualizarMedias(id, request).subscribe({
        next: () => store._ligaListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao atualizar médias' })
      });
    },
    calibrar(id: string): void {
      patchState(store, { mutationError: null });
      store._ligaDataService.calibrar(id).subscribe({
        next: () => store._ligaListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao calibrar liga' })
      });
    }
  }))
);
