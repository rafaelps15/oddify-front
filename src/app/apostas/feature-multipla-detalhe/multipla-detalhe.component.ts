import { Component, effect, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MultiplaDetalheStore } from '../application/multipla-detalhe.store';
import { ResultadoDaAposta } from '../entities/resultado-da-aposta';
import { LoadingIndicatorComponent, ErrorMessageComponent } from '../../shared/ui';

@Component({
  selector: 'app-multipla-detalhe',
  imports: [RouterLink, DecimalPipe, LoadingIndicatorComponent, ErrorMessageComponent],
  templateUrl: './multipla-detalhe.component.html'
})
export class MultiplaDetalheComponent {
  protected readonly store = inject(MultiplaDetalheStore);
  protected readonly ResultadoDaAposta = ResultadoDaAposta;

  id = input.required<string>();

  constructor() {
    effect(() => this.store.setId(this.id()));
  }

  labelResultado(resultado: ResultadoDaAposta): string {
    switch (resultado) {
      case ResultadoDaAposta.Ganha:
        return 'Ganha';
      case ResultadoDaAposta.Perdida:
        return 'Perdida';
      default:
        return 'Pendente';
    }
  }

  classeResultado(resultado: ResultadoDaAposta): string {
    switch (resultado) {
      case ResultadoDaAposta.Ganha:
        return 'badge--good';
      case ResultadoDaAposta.Perdida:
        return 'badge--critical';
      default:
        return 'badge--info';
    }
  }
}
