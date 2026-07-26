import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { PartidaDataService } from '../infrastructure/partida.data.service';
import { PartidasStore } from './partidas.store';

describe('PartidasStore', () => {
  let dataService: {
    criar: Mock;
    getById: Mock;
    listar: Mock;
    reagendar: Mock;
    registrarResultado: Mock;
    getHistoricoRecente: Mock;
  };

  beforeEach(() => {
    dataService = {
      criar: vi.fn(),
      getById: vi.fn(),
      listar: vi.fn().mockReturnValue(of([])),
      reagendar: vi.fn(),
      registrarResultado: vi.fn(),
      getHistoricoRecente: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [PartidasStore, { provide: PartidaDataService, useValue: dataService }]
    });
  });

  it('loads every partida when no liga filter is set', async () => {
    dataService.listar.mockReturnValue(of([{ id: '1', idExterno: 'p1' }]));

    const store = TestBed.inject(PartidasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.listar).toHaveBeenCalledWith(undefined);
    expect(store.partidaList()).toHaveLength(1);
  });

  it('refilters when filtrarPorLiga is called', async () => {
    const store = TestBed.inject(PartidasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    dataService.listar.mockReturnValue(of([{ id: '2', idExterno: 'p2', ligaId: 'liga-1' }]));
    store.filtrarPorLiga('liga-1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.listar).toHaveBeenCalledWith('liga-1');
  });

  it('surfaces the error on a failed load', async () => {
    dataService.listar.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(PartidasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeTruthy();
  });
});
