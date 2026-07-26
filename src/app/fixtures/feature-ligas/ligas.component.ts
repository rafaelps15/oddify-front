import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LigasStore } from '../application/ligas.store';
import {
  LoadingIndicatorComponent,
  ErrorMessageComponent,
  EmptyStateComponent,
  SearchInputComponent
} from '../../shared/ui';

@Component({
  selector: 'app-ligas',
  imports: [RouterLink, LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent, SearchInputComponent],
  templateUrl: './ligas.component.html'
})
export class LigasComponent {
  protected readonly store = inject(LigasStore);
  protected readonly editingLigaId = signal<string | null>(null);
  protected readonly termoBusca = signal('');

  protected readonly ligasFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const lista = this.store.ligaList();
    if (!termo) {
      return lista;
    }
    return lista.filter(
      (liga) => liga.nome.toLowerCase().includes(termo) || liga.idExterno.toLowerCase().includes(termo)
    );
  });

  onCriar(
    event: Event,
    nome: HTMLInputElement,
    idExterno: HTMLInputElement,
    media: HTMLInputElement,
    fator: HTMLInputElement
  ): void {
    event.preventDefault();
    this.store.criar({
      idExterno: idExterno.value,
      nome: nome.value,
      mediaDeGols: Number(media.value),
      fatorCasa: Number(fator.value)
    });
    idExterno.value = '';
    nome.value = '';
    media.value = '';
    fator.value = '';
  }

  salvarMedias(ligaId: string, mediaInput: HTMLInputElement, fatorInput: HTMLInputElement): void {
    this.store.atualizarMedias(ligaId, {
      mediaDeGols: Number(mediaInput.value),
      fatorCasa: Number(fatorInput.value)
    });
    this.editingLigaId.set(null);
  }
}
