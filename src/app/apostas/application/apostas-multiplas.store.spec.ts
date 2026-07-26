import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { ApostaMultiplaDataService } from '../infrastructure/aposta-multipla.data.service';
import { ApostasMultiplasStore } from './apostas-multiplas.store';

describe('ApostasMultiplasStore', () => {
  let dataService: { getById: Mock; listar: Mock; getRoi: Mock; montar: Mock; liquidar: Mock };

  beforeEach(() => {
    dataService = {
      getById: vi.fn(),
      listar: vi.fn().mockReturnValue(of([])),
      getRoi: vi.fn().mockReturnValue(of({ lucroTotal: 0, totalApostado: 0, roi: null })),
      montar: vi.fn(),
      liquidar: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [ApostasMultiplasStore, { provide: ApostaMultiplaDataService, useValue: dataService }]
    });
  });

  it('loads the list and roi even without a bancaId set', async () => {
    TestBed.inject(ApostasMultiplasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.listar).toHaveBeenCalledWith(undefined);
    expect(dataService.getRoi).toHaveBeenCalledWith(undefined);
  });

  it('reloads both list and roi when setBancaId is called', async () => {
    const store = TestBed.inject(ApostasMultiplasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    dataService.listar.mockReturnValue(of([{ id: '1' }]));
    store.setBancaId('banca-1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.listar).toHaveBeenCalledWith('banca-1');
    expect(dataService.getRoi).toHaveBeenCalledWith('banca-1');
  });

  it('surfaces the error on a failed load', async () => {
    dataService.listar.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(ApostasMultiplasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeTruthy();
  });

  it('reloads the list and roi after a successful liquidar', async () => {
    dataService.liquidar.mockReturnValue(of(undefined));

    const store = TestBed.inject(ApostasMultiplasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    store.liquidar('m1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.liquidar).toHaveBeenCalledWith('m1');
    expect(dataService.listar).toHaveBeenCalledTimes(2);
    expect(dataService.getRoi).toHaveBeenCalledTimes(2);
  });

  it('surfaces a mutation error when liquidar fails', async () => {
    dataService.liquidar.mockReturnValue(throwError(() => new Error('ApostasMultiplas.PartidaNaoEncerrada')));

    const store = TestBed.inject(ApostasMultiplasStore);
    await TestBed.inject(ApplicationRef).whenStable();

    store.liquidar('m1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.mutationError()).toBeTruthy();
  });
});
