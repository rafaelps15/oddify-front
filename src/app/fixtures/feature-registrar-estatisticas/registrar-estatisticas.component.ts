import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RegistrarEstatisticasStore } from '../application/registrar-estatisticas.store';
import { ErrorMessageComponent } from '../../shared/ui';

@Component({
  selector: 'app-registrar-estatisticas',
  imports: [RouterLink, ErrorMessageComponent],
  templateUrl: './registrar-estatisticas.component.html'
})
export class RegistrarEstatisticasComponent {
  protected readonly store = inject(RegistrarEstatisticasStore);

  id = input.required<string>();

  onRegistrarEquipe(
    event: Event,
    equipeId: HTMLInputElement,
    gols: HTMLInputElement,
    finalizacoes: HTMLInputElement,
    escanteios: HTMLInputElement,
    posse: HTMLInputElement
  ): void {
    event.preventDefault();
    this.store.registrarEquipe({
      partidaId: this.id(),
      equipeId: equipeId.value,
      gols: Number(gols.value),
      finalizacoes: Number(finalizacoes.value),
      escanteios: Number(escanteios.value),
      posse: Number(posse.value)
    });
  }

  onRegistrarJogador(
    event: Event,
    jogadorId: HTMLInputElement,
    gols: HTMLInputElement,
    assistencias: HTMLInputElement,
    minutos: HTMLInputElement,
    titular: HTMLInputElement,
    nota: HTMLInputElement
  ): void {
    event.preventDefault();
    this.store.registrarJogador({
      partidaId: this.id(),
      jogadorId: jogadorId.value,
      gols: Number(gols.value),
      assistencias: Number(assistencias.value),
      minutos: Number(minutos.value),
      titular: titular.checked,
      nota: Number(nota.value)
    });
  }
}
