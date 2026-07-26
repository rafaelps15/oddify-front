import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { BancaDataService } from '../infrastructure/banca.data.service';
import { BancaStore } from './banca.store';

const BANCA_ATIVA_KEY = 'apostas.bancaAtivaId';

describe('BancaStore', () => {
  let dataService: { criar: Mock; getById: Mock };

  beforeEach(() => {
    localStorage.clear();
    dataService = { criar: vi.fn(), getById: vi.fn() };

    TestBed.configureTestingModule({
      providers: [BancaStore, { provide: BancaDataService, useValue: dataService }]
    });
  });

  it('does not load a banca when nothing is saved in localStorage', async () => {
    const store = TestBed.inject(BancaStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.temBancaConfigurada()).toBe(false);
    expect(dataService.getById).not.toHaveBeenCalled();
  });

  it('loads the banca saved in localStorage on creation', async () => {
    localStorage.setItem(BANCA_ATIVA_KEY, 'banca-1');
    dataService.getById.mockReturnValue(of({ id: 'banca-1', saldoAtual: 1000, modoPaperTrading: true }));

    const store = TestBed.inject(BancaStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.getById).toHaveBeenCalledWith('banca-1');
    expect(store.banca()?.saldoAtual).toBe(1000);
  });

  it('saves the new banca id to localStorage after criar succeeds', async () => {
    dataService.criar.mockReturnValue(of('banca-nova'));
    dataService.getById.mockReturnValue(of({ id: 'banca-nova', saldoAtual: 500, modoPaperTrading: true }));

    const store = TestBed.inject(BancaStore);
    store.criar({ saldoInicial: 500, modoPaperTrading: true });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(localStorage.getItem(BANCA_ATIVA_KEY)).toBe('banca-nova');
    expect(store.banca()?.id).toBe('banca-nova');
  });

  it('surfaces a mutation error when criar fails', async () => {
    dataService.criar.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(BancaStore);
    store.criar({ saldoInicial: 500, modoPaperTrading: true });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.mutationError()).toBeTruthy();
  });

  it('esquecerBanca clears localStorage and the current banca', async () => {
    localStorage.setItem(BANCA_ATIVA_KEY, 'banca-1');
    dataService.getById.mockReturnValue(of({ id: 'banca-1', saldoAtual: 1000, modoPaperTrading: true }));

    const store = TestBed.inject(BancaStore);
    await TestBed.inject(ApplicationRef).whenStable();

    store.esquecerBanca();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(localStorage.getItem(BANCA_ATIVA_KEY)).toBeNull();
    expect(store.temBancaConfigurada()).toBe(false);
  });
});
