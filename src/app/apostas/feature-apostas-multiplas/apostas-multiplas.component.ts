import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApostasMultiplasStore } from '../application/apostas-multiplas.store';
import { BancaStore } from '../application/banca.store';
import { ResultadoDaAposta } from '../entities/resultado-da-aposta';
import { LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent } from '../../shared/ui';

@Component({
  selector: 'app-apostas-multiplas',
  imports: [RouterLink, DecimalPipe, LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent],
  templateUrl: './apostas-multiplas.component.html'
})
export class ApostasMultiplasComponent {
  protected readonly store = inject(ApostasMultiplasStore);
  protected readonly bancaStore = inject(BancaStore);
  protected readonly ResultadoDaAposta = ResultadoDaAposta;
  protected readonly resultadoFiltro = signal<ResultadoDaAposta | null>(null);

  protected readonly listaFiltrada = computed(() => {
    const resultado = this.resultadoFiltro();
    const lista = this.store.apostaMultiplaList();
    return resultado === null ? lista : lista.filter((multipla) => multipla.resultado === resultado);
  });

  private readonly router = inject(Router);

  constructor() {
    effect(() => this.store.setBancaId(this.bancaStore.banca()?.id));
    effect(() => {
      if (!this.bancaStore.loading() && !this.bancaStore.temBancaConfigurada()) {
        this.router.navigate(['/banca']);
      }
    });
  }

  onFiltrarPorResultado(select: HTMLSelectElement): void {
    this.resultadoFiltro.set(select.value === '' ? null : (Number(select.value) as ResultadoDaAposta));
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
