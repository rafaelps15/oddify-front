import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PartidasStore } from '../application/partidas.store';
import { SituacaoDaPartida } from '../entities/partida';
import { LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent } from '../../shared/ui';

@Component({
  selector: 'app-historico',
  imports: [RouterLink, LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent],
  templateUrl: './historico.component.html'
})
export class HistoricoComponent {
  protected readonly store = inject(PartidasStore);
  protected readonly SituacaoDaPartida = SituacaoDaPartida;

  protected readonly partidasEncerradas = computed(() =>
    this.store
      .partidaList()
      .filter((partida) => partida.situacao !== SituacaoDaPartida.Agendada)
      .slice()
      .sort((a, b) => b.dataUtc.localeCompare(a.dataUtc))
  );

  classeSituacao(situacao: SituacaoDaPartida): string {
    return situacao === SituacaoDaPartida.Liquidada ? 'badge--good' : 'badge--neutral';
  }
}
