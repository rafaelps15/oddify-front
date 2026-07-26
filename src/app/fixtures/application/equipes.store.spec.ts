import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { EquipeDataService } from '../infrastructure/equipe.data.service';
import { EquipesStore } from './equipes.store';

describe('EquipesStore', () => {
  let dataService: { criar: Mock; getById: Mock; listarPorLiga: Mock; renomear: Mock };

  beforeEach(() => {
    dataService = {
      criar: vi.fn(),
      getById: vi.fn(),
      listarPorLiga: vi.fn().mockReturnValue(of([])),
      renomear: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [EquipesStore, { provide: EquipeDataService, useValue: dataService }]
    });
  });

  it('does not load any equipe before a ligaId is set', async () => {
    const store = TestBed.inject(EquipesStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.equipeList()).toEqual([]);
    expect(dataService.listarPorLiga).not.toHaveBeenCalled();
  });

  it('loads equipes once a ligaId is set', async () => {
    dataService.listarPorLiga.mockReturnValue(of([{ id: '1', idExterno: 'e1', nome: 'Time A', ligaId: 'liga-1' }]));

    const store = TestBed.inject(EquipesStore);
    store.setLigaId('liga-1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.listarPorLiga).toHaveBeenCalledWith('liga-1');
    expect(store.equipeList()).toHaveLength(1);
  });

  it('surfaces the error on a failed load', async () => {
    dataService.listarPorLiga.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(EquipesStore);
    store.setLigaId('liga-1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeTruthy();
  });

  it('reloads the list after renaming an equipe', async () => {
    dataService.renomear.mockReturnValue(of(undefined));

    const store = TestBed.inject(EquipesStore);
    store.setLigaId('liga-1');
    await TestBed.inject(ApplicationRef).whenStable();

    dataService.listarPorLiga.mockReturnValue(of([{ id: '1', idExterno: 'e1', nome: 'Novo Nome', ligaId: 'liga-1' }]));
    store.renomear('1', 'Novo Nome');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.renomear).toHaveBeenCalledWith('1', 'Novo Nome');
    expect(store.equipeList()[0].nome).toBe('Novo Nome');
  });
});
