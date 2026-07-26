import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { ApostaMultiplaDataService } from '../infrastructure/aposta-multipla.data.service';
import { MultiplaDetalheStore } from './multipla-detalhe.store';

const MULTIPLA = {
  id: 'm1',
  bancaId: 'banca-1',
  oddCombinada: 2.5,
  stake: 100,
  resultado: 0,
  lucroOuPerda: null,
  criadaEmUtc: '2026-01-01T00:00:00Z'
};

describe('MultiplaDetalheStore', () => {
  let dataService: { getById: Mock; listar: Mock; getRoi: Mock; montar: Mock; liquidar: Mock };

  beforeEach(() => {
    dataService = {
      getById: vi.fn().mockReturnValue(of(MULTIPLA)),
      listar: vi.fn(),
      getRoi: vi.fn(),
      montar: vi.fn(),
      liquidar: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [MultiplaDetalheStore, { provide: ApostaMultiplaDataService, useValue: dataService }]
    });
  });

  it('loads the múltipla once an id is set', async () => {
    const store = TestBed.inject(MultiplaDetalheStore);
    store.setId('m1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.getById).toHaveBeenCalledWith('m1');
    expect(store.multipla()?.oddCombinada).toBe(2.5);
  });

  it('reloads the múltipla after a successful liquidar', async () => {
    dataService.liquidar.mockReturnValue(of(undefined));

    const store = TestBed.inject(MultiplaDetalheStore);
    store.setId('m1');
    await TestBed.inject(ApplicationRef).whenStable();

    store.liquidar();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.liquidar).toHaveBeenCalledWith('m1');
    expect(dataService.getById).toHaveBeenCalledTimes(2);
  });

  it('surfaces a mutation error when liquidar fails', async () => {
    dataService.liquidar.mockReturnValue(throwError(() => new Error('ApostasMultiplas.PartidaNaoEncerrada')));

    const store = TestBed.inject(MultiplaDetalheStore);
    store.setId('m1');
    await TestBed.inject(ApplicationRef).whenStable();

    store.liquidar();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.mutationError()).toBeTruthy();
  });
});
