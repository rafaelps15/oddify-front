import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { EstatisticaEquipeDataService } from '../infrastructure/estatistica-equipe.data.service';
import { EstatisticaJogadorDataService } from '../infrastructure/estatistica-jogador.data.service';
import { RegistrarEstatisticasStore } from './registrar-estatisticas.store';

describe('RegistrarEstatisticasStore', () => {
  let equipeDataService: { registrar: Mock };
  let jogadorDataService: { registrar: Mock };

  beforeEach(() => {
    equipeDataService = { registrar: vi.fn() };
    jogadorDataService = { registrar: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        RegistrarEstatisticasStore,
        { provide: EstatisticaEquipeDataService, useValue: equipeDataService },
        { provide: EstatisticaJogadorDataService, useValue: jogadorDataService }
      ]
    });
  });

  it('marks the equipe registration as successful', async () => {
    equipeDataService.registrar.mockReturnValue(of('id-1'));
    const request = { partidaId: 'p1', equipeId: 'e1', gols: 2, finalizacoes: 10, escanteios: 5, posse: 55 };

    const store = TestBed.inject(RegistrarEstatisticasStore);
    store.registrarEquipe(request);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(equipeDataService.registrar).toHaveBeenCalledWith(request);
    expect(store.equipeRegistrada()).toBe(true);
  });

  it('surfaces the error when registering equipe stats fails', async () => {
    equipeDataService.registrar.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(RegistrarEstatisticasStore);
    store.registrarEquipe({ partidaId: 'p1', equipeId: 'e1', gols: 0, finalizacoes: 0, escanteios: 0, posse: 50 });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.mutationError()).toBeTruthy();
    expect(store.equipeRegistrada()).toBe(false);
  });

  it('marks the jogador registration as successful independently of equipe', async () => {
    jogadorDataService.registrar.mockReturnValue(of('id-2'));
    const request = {
      partidaId: 'p1',
      jogadorId: 'j1',
      gols: 1,
      assistencias: 1,
      minutos: 90,
      titular: true,
      nota: 7.5
    };

    const store = TestBed.inject(RegistrarEstatisticasStore);
    store.registrarJogador(request);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(jogadorDataService.registrar).toHaveBeenCalledWith(request);
    expect(store.jogadorRegistrado()).toBe(true);
    expect(store.equipeRegistrada()).toBe(false);
  });
});
