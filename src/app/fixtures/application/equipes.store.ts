import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { CriarEquipeRequest, EquipeDataService } from '../infrastructure/equipe.data.service';

export const EquipesStore = signalStore(
  { providedIn: 'root' },
  withState({
    ligaId: undefined as string | undefined,
    mutationError: null as string | null
  }),
  withProps(() => ({
    _equipeDataService: inject(EquipeDataService)
  })),
  withProps((store) => ({
    _equipeListResource: rxResource({
      params: () => store.ligaId(),
      stream: ({ params }) =>
        params !== undefined ? store._equipeDataService.listarPorLiga(params) : of([])
    })
  })),
  withComputed((store) => ({
    equipeList: computed(() => (store._equipeListResource.hasValue() ? store._equipeListResource.value() : [])),
    loading: computed(() => store._equipeListResource.isLoading()),
    error: computed(() => store._equipeListResource.error()?.message ?? null)
  })),
  withMethods((store) => ({
    setLigaId(ligaId: string): void {
      patchState(store, { ligaId });
    },
    criar(request: CriarEquipeRequest): void {
      patchState(store, { mutationError: null });
      store._equipeDataService.criar(request).subscribe({
        next: () => store._equipeListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao criar equipe' })
      });
    },
    renomear(id: string, nome: string): void {
      patchState(store, { mutationError: null });
      store._equipeDataService.renomear(id, nome).subscribe({
        next: () => store._equipeListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao renomear equipe' })
      });
    }
  }))
);
