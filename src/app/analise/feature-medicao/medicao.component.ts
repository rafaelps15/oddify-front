import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MedicaoStore } from '../application/medicao.store';
import { LoadingIndicatorComponent, ErrorMessageComponent } from '../../shared/ui';

interface BarraBrier {
  rotulo: string;
  valor: number | null;
  amostra: number;
  cor: string;
}

@Component({
  selector: 'app-medicao',
  imports: [DecimalPipe, LoadingIndicatorComponent, ErrorMessageComponent],
  templateUrl: './medicao.component.html',
  styleUrl: './medicao.component.scss'
})
export class MedicaoComponent {
  protected readonly store = inject(MedicaoStore);

  protected readonly barras = computed<BarraBrier[]>(() => {
    const medicao = this.store.medicao();
    if (!medicao) {
      return [];
    }
    return [
      { rotulo: 'Poisson pura', valor: medicao.brierPoissonPuro, amostra: medicao.amostraTotal, cor: 'var(--series-1)' },
      { rotulo: 'Dixon-Coles', valor: medicao.brierDixonColes, amostra: medicao.amostraTotal, cor: 'var(--series-2)' },
      {
        rotulo: 'Dixon-Coles pós-Claude',
        valor: medicao.brierPosClaude,
        amostra: medicao.amostraPosClaude,
        cor: 'var(--series-3)'
      }
    ];
  });

  protected readonly maiorBrier = computed(() => {
    const valores = this.barras()
      .map((barra) => barra.valor)
      .filter((valor): valor is number => valor !== null);
    return valores.length > 0 ? Math.max(...valores) : 1;
  });

  larguraDaBarra(valor: number | null): number {
    if (valor === null || this.maiorBrier() === 0) {
      return 0;
    }
    return (valor / this.maiorBrier()) * 100;
  }
}
