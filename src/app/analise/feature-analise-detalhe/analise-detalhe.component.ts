import { Component, effect, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnaliseDetalheStore } from '../application/analise-detalhe.store';
import { DecisaoDoClaude, classeDecisaoDoClaude, labelDecisaoDoClaude } from '../entities/decisao-do-claude';
import { LoadingIndicatorComponent, ErrorMessageComponent } from '../../shared/ui';

@Component({
  selector: 'app-analise-detalhe',
  imports: [RouterLink, DecimalPipe, LoadingIndicatorComponent, ErrorMessageComponent],
  templateUrl: './analise-detalhe.component.html'
})
export class AnaliseDetalheComponent {
  protected readonly store = inject(AnaliseDetalheStore);
  protected readonly DecisaoDoClaude = DecisaoDoClaude;

  id = input.required<string>();

  constructor() {
    effect(() => this.store.setId(this.id()));
  }

  onAvaliarComClaude(event: Event, contextoAdicional: HTMLTextAreaElement): void {
    event.preventDefault();
    this.store.avaliarComClaude({ contextoAdicional: contextoAdicional.value || undefined });
    contextoAdicional.value = '';
  }

  labelDecisao = labelDecisaoDoClaude;

  classeDecisao = classeDecisaoDoClaude;
}
