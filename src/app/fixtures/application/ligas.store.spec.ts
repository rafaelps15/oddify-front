import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { LigaDataService } from '../infrastructure/liga.data.service';
import { LigasStore } from './ligas.store';

describe('LigasStore', () => {
  let dataService: { criar: Mock; getById: Mock; listar: Mock; atualizarMedias: Mock; calibrar: Mock };

  beforeEach(() => {
    dataService = {
      criar: vi.fn(),
      getById: vi.fn(),
      listar: vi.fn().mockReturnValue(of([])),
      atualizarMedias: vi.fn(),
      calibrar: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [LigasStore, { provide: LigaDataService, useValue: dataService }]
    });
  });

  it('exposes the loaded ligas', async () => {
    dataService.listar.mockReturnValue(
      of([{ id: '1', idExterno: 'ext-1', nome: 'Premier League', mediaDeGols: 2.7, fatorCasa: 1.1, calibrada: false }])
    );

    const store = TestBed.inject(LigasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.ligaList()).toHaveLength(1);
    expect(store.ligaList()[0].nome).toBe('Premier League');
  });

  it('surfaces the error on a failed load', async () => {
    dataService.listar.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(LigasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeTruthy();
  });

  it('reloads the list after creating a liga', async () => {
    dataService.criar.mockReturnValue(of('new-id'));

    const store = TestBed.inject(LigasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    dataService.listar.mockReturnValue(
      of([{ id: 'new-id', idExterno: 'ext-2', nome: 'La Liga', mediaDeGols: 2.4, fatorCasa: 1.2, calibrada: false }])
    );

    store.criar({ idExterno: 'ext-2', nome: 'La Liga', mediaDeGols: 2.4, fatorCasa: 1.2 });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.criar).toHaveBeenCalledWith({
      idExterno: 'ext-2',
      nome: 'La Liga',
      mediaDeGols: 2.4,
      fatorCasa: 1.2
    });
    expect(store.ligaList()).toHaveLength(1);
  });

  it('surfaces a mutation error without touching the read resource error', async () => {
    dataService.calibrar.mockReturnValue(throwError(() => new Error('não pôde calibrar')));

    const store = TestBed.inject(LigasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    store.calibrar('1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.mutationError()).toBeTruthy();
    expect(store.error()).toBeNull();
  });
});
