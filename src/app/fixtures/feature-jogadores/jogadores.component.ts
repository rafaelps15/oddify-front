import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { JogadoresStore } from '../application/jogadores.store';
import {
  LoadingIndicatorComponent,
  ErrorMessageComponent,
  EmptyStateComponent,
  SearchInputComponent
} from '../../shared/ui';

@Component({
  selector: 'app-jogadores',
  imports: [LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent, SearchInputComponent],
  templateUrl: './jogadores.component.html'
})
export class JogadoresComponent {
  protected readonly store = inject(JogadoresStore);
  protected readonly termoBusca = signal('');

  protected readonly jogadoresFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const lista = this.store.jogadorList();
    if (!termo) {
      return lista;
    }
    return lista.filter(
      (jogador) =>
        jogador.nome.toLowerCase().includes(termo) ||
        jogador.idExterno.toLowerCase().includes(termo) ||
        jogador.posicao.toLowerCase().includes(termo)
    );
  });

  equipeId = input.required<string>();

  constructor() {
    effect(() => this.store.setEquipeId(this.equipeId()));
  }

  onCriar(event: Event, nome: HTMLInputElement, idExterno: HTMLInputElement, posicao: HTMLInputElement): void {
    event.preventDefault();
    this.store.criar({
      idExterno: idExterno.value,
      equipeId: this.equipeId(),
      nome: nome.value,
      posicao: posicao.value
    });
    idExterno.value = '';
    nome.value = '';
    posicao.value = '';
  }

  onTransferir(event: Event, jogadorId: string, novaEquipeId: HTMLInputElement): void {
    event.preventDefault();
    this.store.transferir(jogadorId, novaEquipeId.value);
    novaEquipeId.value = '';
  }
}
