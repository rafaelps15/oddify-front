import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PartidasStore } from '../application/partidas.store';
import { LigasStore } from '../application/ligas.store';
import { SituacaoDaPartida } from '../entities/partida';
import {
  LoadingIndicatorComponent,
  ErrorMessageComponent,
  EmptyStateComponent,
  SearchInputComponent
} from '../../shared/ui';

@Component({
  selector: 'app-partidas',
  imports: [
    RouterLink,
    LoadingIndicatorComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    SearchInputComponent
  ],
  templateUrl: './partidas.component.html'
})
export class PartidasComponent {
  protected readonly store = inject(PartidasStore);
  protected readonly ligasStore = inject(LigasStore);
  protected readonly SituacaoDaPartida = SituacaoDaPartida;
  protected readonly termoBusca = signal('');
  protected readonly situacaoFiltro = signal<SituacaoDaPartida | null>(null);

  protected readonly partidasFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const situacao = this.situacaoFiltro();
    return this.store.partidaList().filter((partida) => {
      const bateTermo = !termo || partida.idExterno.toLowerCase().includes(termo);
      const bateSituacao = situacao === null || partida.situacao === situacao;
      return bateTermo && bateSituacao;
    });
  });

  onFiltrarPorLiga(select: HTMLSelectElement): void {
    this.store.filtrarPorLiga(select.value || undefined);
  }

  onFiltrarPorSituacao(select: HTMLSelectElement): void {
    this.situacaoFiltro.set(select.value === '' ? null : (Number(select.value) as SituacaoDaPartida));
  }

  onCriar(
    event: Event,
    idExterno: HTMLInputElement,
    ligaId: HTMLSelectElement,
    equipeCasaId: HTMLInputElement,
    equipeVisitanteId: HTMLInputElement,
    dataUtc: HTMLInputElement
  ): void {
    event.preventDefault();
    this.store.criar({
      idExterno: idExterno.value,
      ligaId: ligaId.value,
      equipeCasaId: equipeCasaId.value,
      equipeVisitanteId: equipeVisitanteId.value,
      dataUtc: new Date(dataUtc.value).toISOString()
    });
    idExterno.value = '';
    equipeCasaId.value = '';
    equipeVisitanteId.value = '';
    dataUtc.value = '';
  }

  classeSituacao(situacao: SituacaoDaPartida): string {
    switch (situacao) {
      case SituacaoDaPartida.Encerrada:
        return 'badge--neutral';
      case SituacaoDaPartida.Liquidada:
        return 'badge--good';
      default:
        return 'badge--info';
    }
  }
}
