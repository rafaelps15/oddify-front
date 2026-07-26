import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AnaliseDataService, DecisaoDoClaude } from '../../analise';
import { ApostaMultiplaDataService, MontarMultiplaRequest } from '../infrastructure/aposta-multipla.data.service';

export const MontarMultiplaStore = signalStore(
  { providedIn: 'root' },
  withState({
    multiplaCriadaId: null as string | null,
    mutationError: null as string | null
  }),
  withProps(() => ({
    _analiseDataService: inject(AnaliseDataService),
    _apostaMultiplaDataService: inject(ApostaMultiplaDataService)
  })),
  withProps((store) => ({
    _candidatasResource: rxResource({
      stream: () => store._analiseDataService.getAprovadas()
    })
  })),
  withComputed((store) => ({
    // Não há endpoint de "análises disponíveis para aposta" no módulo apostas — reaproveita as
    // análises aprovadas do domínio analise, filtrando pela mesma regra que o backend usa pra
    // publicar o evento que alimentaria essa lista (Confirma ou Reduz).
    candidatas: computed(() => {
      const lista = store._candidatasResource.hasValue() ? store._candidatasResource.value() : [];
      return lista.filter(
        (analise) => analise.decisaoDoClaude === DecisaoDoClaude.Confirma || analise.decisaoDoClaude === DecisaoDoClaude.Reduz
      );
    }),
    loading: computed(() => store._candidatasResource.isLoading()),
    error: computed(() => store._candidatasResource.error()?.message ?? null)
  })),
  withMethods((store) => ({
    montar(request: MontarMultiplaRequest): void {
      patchState(store, { mutationError: null, multiplaCriadaId: null });
      store._apostaMultiplaDataService.montar(request).subscribe({
        next: (id) => patchState(store, { multiplaCriadaId: id }),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao montar múltipla' })
      });
    }
  }))
);
