import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BancaStore } from '../application/banca.store';

@Component({
  selector: 'app-alavancagem',
  imports: [FormsModule],
  templateUrl: './alavancagem.component.html'
})
export class AlavancagemComponent {
  protected readonly bancaStore = inject(BancaStore);

  protected readonly odd = signal(2.0);
  protected readonly probabilidadePercent = signal(55);
  protected readonly fracaoDeKelly = signal(0.5);
  protected readonly banca = signal(1000);
  private readonly bancaFoiPreenchidaAutomaticamente = signal(false);

  constructor() {
    effect(() => {
      const saldoAtual = this.bancaStore.banca()?.saldoAtual;
      if (saldoAtual !== undefined && !this.bancaFoiPreenchidaAutomaticamente()) {
        this.banca.set(saldoAtual);
        this.bancaFoiPreenchidaAutomaticamente.set(true);
      }
    });
  }

  private readonly kellyIntegral = computed(() => {
    const b = this.odd() - 1;
    const p = this.probabilidadePercent() / 100;
    const q = 1 - p;
    if (b <= 0) {
      return 0;
    }
    return (b * p - q) / b;
  });

  protected readonly probabilidadeImplicita = computed(() => (this.odd() > 0 ? (1 / this.odd()) * 100 : 0));

  protected readonly edge = computed(() => this.probabilidadePercent() - this.probabilidadeImplicita());

  protected readonly kellyFracionado = computed(() => Math.max(0, this.kellyIntegral()) * this.fracaoDeKelly());

  protected readonly stakeSugerido = computed(() => this.kellyFracionado() * this.banca());

  protected readonly temValorPositivo = computed(() => this.kellyIntegral() > 0);
}
