import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { JogadorDataService } from '../infrastructure/jogador.data.service';
import { JogadoresStore } from './jogadores.store';

describe('JogadoresStore', () => {
  let dataService: { criar: Mock; getById: Mock; listarPorEquipe: Mock; transferir: Mock };

  beforeEach(() => {
    dataService = {
      criar: vi.fn(),
      getById: vi.fn(),
      listarPorEquipe: vi.fn().mockReturnValue(of([])),
      transferir: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [JogadoresStore, { provide: JogadorDataService, useValue: dataService }]
    });
  });

  it('loads jogadores once an equipeId is set', async () => {
    dataService.listarPorEquipe.mockReturnValue(
      of([{ id: '1', idExterno: 'j1', equipeId: 'equipe-1', nome: 'Jogador A', posicao: 'ATA' }])
    );

    const store = TestBed.inject(JogadoresStore);
    store.setEquipeId('equipe-1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.listarPorEquipe).toHaveBeenCalledWith('equipe-1');
    expect(store.jogadorList()).toHaveLength(1);
  });

  it('surfaces a mutation error when transferir fails', async () => {
    dataService.transferir.mockReturnValue(throwError(() => new Error('Jogadores.JaNaEquipe')));

    const store = TestBed.inject(JogadoresStore);
    store.setEquipeId('equipe-1');
    await TestBed.inject(ApplicationRef).whenStable();

    store.transferir('1', 'equipe-1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.mutationError()).toBeTruthy();
  });

  it('reloads the list after a successful transferir', async () => {
    dataService.transferir.mockReturnValue(of(undefined));

    const store = TestBed.inject(JogadoresStore);
    store.setEquipeId('equipe-1');
    await TestBed.inject(ApplicationRef).whenStable();

    dataService.listarPorEquipe.mockReturnValue(of([]));
    store.transferir('1', 'equipe-2');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.listarPorEquipe).toHaveBeenCalledTimes(2);
  });
});
