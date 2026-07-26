import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { CriarJogadorRequest, JogadorDataService } from '../infrastructure/jogador.data.service';

export const JogadoresStore = signalStore(
  { providedIn: 'root' },
  withState({
    equipeId: undefined as string | undefined,
    mutationError: null as string | null
  }),
  withProps(() => ({
    _jogadorDataService: inject(JogadorDataService)
  })),
  withProps((store) => ({
    _jogadorListResource: rxResource({
      params: () => store.equipeId(),
      stream: ({ params }) =>
        params !== undefined ? store._jogadorDataService.listarPorEquipe(params) : of([])
    })
  })),
  withComputed((store) => ({
    jogadorList: computed(() => (store._jogadorListResource.hasValue() ? store._jogadorListResource.value() : [])),
    loading: computed(() => store._jogadorListResource.isLoading()),
    error: computed(() => store._jogadorListResource.error()?.message ?? null)
  })),
  withMethods((store) => ({
    setEquipeId(equipeId: string): void {
      patchState(store, { equipeId });
    },
    criar(request: CriarJogadorRequest): void {
      patchState(store, { mutationError: null });
      store._jogadorDataService.criar(request).subscribe({
        next: () => store._jogadorListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao criar jogador' })
      });
    },
    transferir(id: string, novaEquipeId: string): void {
      patchState(store, { mutationError: null });
      store._jogadorDataService.transferir(id, novaEquipeId).subscribe({
        next: () => store._jogadorListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao transferir jogador' })
      });
    }
  }))
);
