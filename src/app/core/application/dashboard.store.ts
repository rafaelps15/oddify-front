import { signalStore, withProps, withComputed } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { Partida, SituacaoDaPartida, PartidasStore, EquipeDataService, CotacaoDataService, Cotacao } from '../../fixtures';
import { Analise, AnalisesStore } from '../../analise';

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _partidasStore: inject(PartidasStore),
    _analisesStore: inject(AnalisesStore),
    _equipeDataService: inject(EquipeDataService),
    _cotacaoDataService: inject(CotacaoDataService)
  })),
  withComputed((store) => ({
    // "Próximas partidas": agendadas, ordenadas pela data mais próxima primeiro.
    proximasPartidas: computed(() =>
      store
        ._partidasStore.partidaList()
        .filter((partida) => partida.situacao === SituacaoDaPartida.Agendada)
        .sort((a, b) => a.dataUtc.localeCompare(b.dataUtc))
        .slice(0, 6)
    ),
    // "Oportunidade em destaque": entre as análises aprovadas, a de maior vantagem cuja partida
    // ainda não aconteceu. Não existe endpoint que agregue casa/empate/fora — é sempre um único
    // mercado real, nunca os três ao mesmo tempo (aprovação exige vantagem positiva).
    oportunidadeDestaque: computed((): Analise | undefined => {
      const agendadasIds = new Set(
        store
          ._partidasStore.partidaList()
          .filter((partida) => partida.situacao === SituacaoDaPartida.Agendada)
          .map((partida) => partida.id)
      );
      const candidatas = store._analisesStore.analiseList().filter((analise) => agendadasIds.has(analise.partidaId));

      return candidatas.length === 0
        ? undefined
        : candidatas.reduce((melhor, atual) => (atual.vantagem > melhor.vantagem ? atual : melhor));
    })
  })),
  withComputed((store) => ({
    partidaDestaque: computed((): Partida | undefined => {
      const analise = store.oportunidadeDestaque();
      return analise ? store._partidasStore.partidaList().find((partida) => partida.id === analise.partidaId) : undefined;
    })
  })),
  withComputed((store) => ({
    equipeIds: computed(() => {
      const ids = new Set<string>();
      const destaque = store.partidaDestaque();

      if (destaque) {
        ids.add(destaque.equipeCasaId);
        ids.add(destaque.equipeVisitanteId);
      }

      for (const partida of store.proximasPartidas()) {
        ids.add(partida.equipeCasaId);
        ids.add(partida.equipeVisitanteId);
      }

      return Array.from(ids);
    })
  })),
  withProps((store) => ({
    _equipesResource: rxResource({
      params: () => store.equipeIds(),
      stream: ({ params }) =>
        params.length === 0 ? of([]) : forkJoin(params.map((id) => store._equipeDataService.getById(id)))
    }),
    _cotacoesResource: rxResource({
      params: () => store.partidaDestaque()?.id,
      stream: ({ params }) => (params ? store._cotacaoDataService.listarPorPartida(params) : of([] as Cotacao[]))
    })
  })),
  withComputed((store) => ({
    nomePorEquipeId: computed(() => {
      const lista = store._equipesResource.hasValue() ? store._equipesResource.value() : [];
      return new Map(lista.map((equipe) => [equipe.id, equipe.nome] as const));
    }),
    // Cotações reais mais recentes pro mercado em destaque — mostra o histórico de verdade em vez
    // de uma seta de tendência inventada.
    cotacoesDoMercadoDestaque: computed((): Cotacao[] => {
      const analise = store.oportunidadeDestaque();
      if (!analise) {
        return [];
      }

      const lista = store._cotacoesResource.hasValue() ? store._cotacoesResource.value() : [];
      return lista
        .filter((cotacao) => cotacao.mercado === analise.mercado)
        .sort((a, b) => b.coletadaEmUtc.localeCompare(a.coletadaEmUtc))
        .slice(0, 4);
    }),
    loading: computed(
      () => store._partidasStore.loading() || store._analisesStore.loading() || store._equipesResource.isLoading()
    ),
    error: computed(
      () =>
        store._partidasStore.error() ??
        store._analisesStore.error() ??
        store._equipesResource.error()?.message ??
        store._cotacoesResource.error()?.message ??
        null
    )
  }))
);
