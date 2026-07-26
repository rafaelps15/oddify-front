import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MontarMultiplaStore } from '../application/montar-multipla.store';
import { BancaStore } from '../application/banca.store';
import { LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent } from '../../shared/ui';

@Component({
  selector: 'app-montar-multipla',
  imports: [RouterLink, DecimalPipe, LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent],
  templateUrl: './montar-multipla.component.html'
})
export class MontarMultiplaComponent {
  protected readonly store = inject(MontarMultiplaStore);
  protected readonly bancaStore = inject(BancaStore);
  protected readonly selecionadas = signal<ReadonlySet<string>>(new Set());
  protected readonly podeMontar = computed(() => this.selecionadas().size >= 2 && this.selecionadas().size <= 3);

  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      const id = this.store.multiplaCriadaId();
      if (id) {
        this.router.navigate(['/apostas-multiplas', id]);
      }
    });
  }

  toggleSelecionada(analiseId: string, checked: boolean): void {
    const novaSelecao = new Set(this.selecionadas());
    if (checked) {
      novaSelecao.add(analiseId);
    } else {
      novaSelecao.delete(analiseId);
    }
    this.selecionadas.set(novaSelecao);
  }

  onMontar(event: Event): void {
    event.preventDefault();
    const bancaId = this.bancaStore.banca()?.id;
    if (bancaId === undefined) {
      return;
    }
    this.store.montar({ bancaId, analiseIds: [...this.selecionadas()] });
  }
}
