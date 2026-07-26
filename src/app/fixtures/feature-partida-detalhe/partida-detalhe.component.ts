import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PartidaDetalheStore } from '../application/partida-detalhe.store';
import { SituacaoDaPartida } from '../entities/partida';
import { LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent } from '../../shared/ui';

@Component({
  selector: 'app-partida-detalhe',
  imports: [RouterLink, LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent],
  templateUrl: './partida-detalhe.component.html'
})
export class PartidaDetalheComponent {
  protected readonly store = inject(PartidaDetalheStore);
  protected readonly SituacaoDaPartida = SituacaoDaPartida;

  id = input.required<string>();

  constructor() {
    effect(() => this.store.setId(this.id()));
  }

  onRegistrarCotacao(
    event: Event,
    mercado: HTMLInputElement,
    odd: HTMLInputElement,
    casa: HTMLInputElement
  ): void {
    event.preventDefault();
    this.store.registrarCotacao({
      mercado: mercado.value,
      odd: Number(odd.value),
      casa: casa.value,
      coletadaEmUtc: new Date().toISOString()
    });
    mercado.value = '';
    odd.value = '';
    casa.value = '';
  }

  onReagendar(event: Event, novaDataUtc: HTMLInputElement): void {
    event.preventDefault();
    this.store.reagendar(new Date(novaDataUtc.value).toISOString());
    novaDataUtc.value = '';
  }

  onRegistrarResultado(event: Event, golsCasa: HTMLInputElement, golsVisitante: HTMLInputElement): void {
    event.preventDefault();
    this.store.registrarResultado({
      golsCasa: Number(golsCasa.value),
      golsVisitante: Number(golsVisitante.value)
    });
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
