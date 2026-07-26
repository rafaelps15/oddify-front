import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DecisaoDoClaude, classeDecisaoDoClaude, labelDecisaoDoClaude, Analise } from '../../analise';
import { MontarMultiplaStore, BancaStore } from '../../apostas';
import { DashboardStore } from '../application/dashboard.store';
import { SystemStatusStore } from '../../shared/application/system-status.store';
import { LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent } from '../../shared/ui';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, PercentPipe, FormsModule, LoadingIndicatorComponent, ErrorMessageComponent, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  protected readonly store = inject(DashboardStore);
  protected readonly montarMultiplaStore = inject(MontarMultiplaStore);
  protected readonly bancaStore = inject(BancaStore);
  protected readonly systemStatusStore = inject(SystemStatusStore);

  protected readonly DecisaoDoClaude = DecisaoDoClaude;
  protected readonly labelDecisao = labelDecisaoDoClaude;
  protected readonly classeDecisao = classeDecisaoDoClaude;

  // Seleção do bilhete é estado de UI (o que o usuário marcou antes de confirmar), não dado
  // buscado do backend — só vira real quando "Confirmar bilhete" chama montarMultiplaStore.montar().
  private readonly idsSelecionados = signal<string[]>([]);
  protected readonly stake = signal(50);

  protected readonly legsSelecionadas = computed<Analise[]>(() => {
    const ids = new Set(this.idsSelecionados());
    return this.montarMultiplaStore.candidatas().filter((candidata) => ids.has(candidata.id));
  });

  protected readonly combinedOdd = computed(() =>
    this.legsSelecionadas().reduce((acc, leg) => acc * leg.oddDeMercado, 1)
  );

  protected readonly potentialReturn = computed(() => this.combinedOdd() * this.stake());

  estaSelecionada(analiseId: string): boolean {
    return this.idsSelecionados().includes(analiseId);
  }

  adicionarAoBilhete(analiseId: string): void {
    if (this.estaSelecionada(analiseId)) {
      return;
    }
    this.idsSelecionados.update((ids) => [...ids, analiseId]);
  }

  removerDoBilhete(analiseId: string): void {
    this.idsSelecionados.update((ids) => ids.filter((id) => id !== analiseId));
  }

  onConfirmarBilhete(): void {
    const banca = this.bancaStore.banca();
    if (!banca || this.legsSelecionadas().length === 0) {
      return;
    }

    this.montarMultiplaStore.montar({ bancaId: banca.id, analiseIds: this.idsSelecionados() });
    this.idsSelecionados.set([]);
  }

  nomeDaEquipe(equipeId: string): string {
    return this.store.nomePorEquipeId().get(equipeId) ?? equipeId;
  }

  iniciaisDaEquipe(equipeId: string): string {
    return this.nomeDaEquipe(equipeId).slice(0, 3).toUpperCase();
  }

  labelMercado(mercado: string): string {
    switch (mercado) {
      case 'vitoria_casa':
        return 'Casa vence';
      case 'empate':
        return 'Empate';
      case 'vitoria_visitante':
        return 'Fora vence';
      case 'ambos_marcam':
        return 'Ambas marcam';
      case 'ambos_marcam_nao':
        return 'Ambas não marcam';
      default:
        return mercado;
    }
  }
}
