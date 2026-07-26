import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalisesStore } from '../application/analises.store';
import { PartidasStore, SituacaoDaPartida } from '../../fixtures';
import {
  LoadingIndicatorComponent,
  ErrorMessageComponent,
  EmptyStateComponent,
  SearchInputComponent
} from '../../shared/ui';
import { DecisaoDoClaude, classeDecisaoDoClaude, labelDecisaoDoClaude } from '../entities/decisao-do-claude';

const MERCADOS_CANONICOS = [
  'vitoria_casa',
  'empate',
  'vitoria_visitante',
  'ambos_marcam',
  'ambos_marcam_nao',
  'over_1_5',
  'over_2_5',
  'under_1_5',
  'under_2_5'
];

@Component({
  selector: 'app-analises',
  imports: [
    RouterLink,
    DecimalPipe,
    LoadingIndicatorComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    SearchInputComponent
  ],
  templateUrl: './analises.component.html'
})
export class AnalisesComponent {
  protected readonly store = inject(AnalisesStore);
  protected readonly partidasStore = inject(PartidasStore);
  protected readonly mercadosCanonicos = MERCADOS_CANONICOS;
  protected readonly SituacaoDaPartida = SituacaoDaPartida;
  protected readonly DecisaoDoClaude = DecisaoDoClaude;
  protected readonly mostrarMercadoCustom = signal(false);
  protected readonly termoBusca = signal('');
  protected readonly decisaoFiltro = signal<DecisaoDoClaude | null>(null);

  protected readonly analisesFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const decisao = this.decisaoFiltro();
    return this.store.analiseList().filter((analise) => {
      const bateTermo = !termo || analise.mercado.toLowerCase().includes(termo);
      const bateDecisao = decisao === null || analise.decisaoDoClaude === decisao;
      return bateTermo && bateDecisao;
    });
  });

  onFiltrarPorDecisao(select: HTMLSelectElement): void {
    this.decisaoFiltro.set(select.value === '' ? null : (Number(select.value) as DecisaoDoClaude));
  }

  onMercadoChange(select: HTMLSelectElement): void {
    this.mostrarMercadoCustom.set(select.value === 'outro');
  }

  onAnalisar(
    event: Event,
    partidaId: HTMLSelectElement,
    mercado: HTMLSelectElement,
    mercadoCustom: HTMLInputElement
  ): void {
    event.preventDefault();
    this.store.analisar({
      partidaId: partidaId.value,
      mercado: mercado.value === 'outro' ? mercadoCustom.value : mercado.value
    });
    mercadoCustom.value = '';
  }

  labelDecisao = labelDecisaoDoClaude;

  classeDecisao = classeDecisaoDoClaude;
}
