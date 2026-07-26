import { Component, inject } from '@angular/core';
import { BancaStore } from '../application/banca.store';
import { LoadingIndicatorComponent, ErrorMessageComponent } from '../../shared/ui';

@Component({
  selector: 'app-banca',
  imports: [LoadingIndicatorComponent, ErrorMessageComponent],
  templateUrl: './banca.component.html'
})
export class BancaComponent {
  protected readonly store = inject(BancaStore);

  onCriar(event: Event, saldoInicial: HTMLInputElement, modoPaperTrading: HTMLInputElement): void {
    event.preventDefault();
    this.store.criar({
      saldoInicial: Number(saldoInicial.value),
      modoPaperTrading: modoPaperTrading.checked
    });
  }

  onUsarBancaExistente(event: Event, bancaId: HTMLInputElement): void {
    event.preventDefault();
    this.store.usarBancaExistente(bancaId.value);
    bancaId.value = '';
  }
}
