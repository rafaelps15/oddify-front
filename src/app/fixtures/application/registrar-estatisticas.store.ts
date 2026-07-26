import { signalStore, withState, withProps, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { EstatisticaEquipeDataService } from '../infrastructure/estatistica-equipe.data.service';
import { EstatisticaJogadorDataService } from '../infrastructure/estatistica-jogador.data.service';
import { EstatisticaEquipe } from '../entities/estatistica-equipe';
import { EstatisticaJogador } from '../entities/estatistica-jogador';

export const RegistrarEstatisticasStore = signalStore(
  { providedIn: 'root' },
  withState({
    equipeRegistrada: false,
    jogadorRegistrado: false,
    mutationError: null as string | null
  }),
  withProps(() => ({
    _estatisticaEquipeDataService: inject(EstatisticaEquipeDataService),
    _estatisticaJogadorDataService: inject(EstatisticaJogadorDataService)
  })),
  withMethods((store) => ({
    registrarEquipe(request: EstatisticaEquipe): void {
      patchState(store, { mutationError: null, equipeRegistrada: false });
      store._estatisticaEquipeDataService.registrar(request).subscribe({
        next: () => patchState(store, { equipeRegistrada: true }),
        error: (err) =>
          patchState(store, { mutationError: err.message ?? 'Erro ao registrar estatística da equipe' })
      });
    },
    registrarJogador(request: EstatisticaJogador): void {
      patchState(store, { mutationError: null, jogadorRegistrado: false });
      store._estatisticaJogadorDataService.registrar(request).subscribe({
        next: () => patchState(store, { jogadorRegistrado: true }),
        error: (err) =>
          patchState(store, { mutationError: err.message ?? 'Erro ao registrar estatística do jogador' })
      });
    }
  }))
);
