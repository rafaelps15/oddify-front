import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { AnaliseDataService } from '../infrastructure/analise.data.service';
import { MedicaoStore } from './medicao.store';

describe('MedicaoStore', () => {
  let dataService: {
    analisar: Mock;
    avaliarComClaude: Mock;
    getById: Mock;
    getAprovadas: Mock;
    getMedicao: Mock;
  };

  beforeEach(() => {
    dataService = {
      analisar: vi.fn(),
      avaliarComClaude: vi.fn(),
      getById: vi.fn(),
      getAprovadas: vi.fn(),
      getMedicao: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [MedicaoStore, { provide: AnaliseDataService, useValue: dataService }]
    });
  });

  it('exposes the medição once loaded', async () => {
    dataService.getMedicao.mockReturnValue(
      of({ amostraTotal: 20, brierPoissonPuro: 0.24, brierDixonColes: 0.21, amostraPosClaude: 8, brierPosClaude: 0.18 })
    );

    const store = TestBed.inject(MedicaoStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.medicao()?.amostraTotal).toBe(20);
  });

  it('surfaces the error on a failed load', async () => {
    dataService.getMedicao.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(MedicaoStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeTruthy();
  });
});
