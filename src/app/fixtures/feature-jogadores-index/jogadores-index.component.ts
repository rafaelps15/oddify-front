import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LigasStore } from '../application/ligas.store';
import { EquipesStore } from '../application/equipes.store';
import { LoadingIndicatorComponent, EmptyStateComponent } from '../../shared/ui';

@Component({
  selector: 'app-jogadores-index',
  imports: [RouterLink, LoadingIndicatorComponent, EmptyStateComponent],
  templateUrl: './jogadores-index.component.html',
  styleUrl: './jogadores-index.component.scss'
})
export class JogadoresIndexComponent {
  protected readonly ligasStore = inject(LigasStore);
  protected readonly equipesStore = inject(EquipesStore);

  protected readonly ligaId = signal('');

  constructor() {
    effect(() => {
      const id = this.ligaId();
      if (id) {
        this.equipesStore.setLigaId(id);
      }
    });
  }

  onSelecionarLiga(select: HTMLSelectElement): void {
    this.ligaId.set(select.value);
  }
}
