import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EquipesStore } from '../application/equipes.store';
import {
  LoadingIndicatorComponent,
  ErrorMessageComponent,
  EmptyStateComponent,
  SearchInputComponent
} from '../../shared/ui';

@Component({
  selector: 'app-equipes',
  imports: [
    RouterLink,
    LoadingIndicatorComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    SearchInputComponent
  ],
  templateUrl: './equipes.component.html'
})
export class EquipesComponent {
  protected readonly store = inject(EquipesStore);
  protected readonly termoBusca = signal('');

  protected readonly equipesFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const lista = this.store.equipeList();
    if (!termo) {
      return lista;
    }
    return lista.filter(
      (equipe) => equipe.nome.toLowerCase().includes(termo) || equipe.idExterno.toLowerCase().includes(termo)
    );
  });

  ligaId = input.required<string>();

  constructor() {
    effect(() => this.store.setLigaId(this.ligaId()));
  }

  onCriar(event: Event, nome: HTMLInputElement, idExterno: HTMLInputElement): void {
    event.preventDefault();
    this.store.criar({ idExterno: idExterno.value, nome: nome.value, ligaId: this.ligaId() });
    idExterno.value = '';
    nome.value = '';
  }

  onRenomear(event: Event, id: string, nome: HTMLInputElement): void {
    event.preventDefault();
    this.store.renomear(id, nome.value);
  }
}
