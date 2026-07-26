import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { AnaliseDataService } from '../infrastructure/analise.data.service';
import { AnalisesStore } from './analises.store';

describe('AnalisesStore', () => {
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
      getAprovadas: vi.fn().mockReturnValue(of([])),
      getMedicao: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [AnalisesStore, { provide: AnaliseDataService, useValue: dataService }]
    });
  });

  it('exposes the approved análises', async () => {
    dataService.getAprovadas.mockReturnValue(
      of([
        {
          id: '1',
          partidaId: 'p1',
          mercado: 'vitoria_casa',
          probPoissonPura: 0.5,
          probDixonColes: 0.52,
          probImplicitaDaOdd: 0.4,
          vantagem: 0.12,
          oddDeMercado: 1.5,
          aprovadaNoFiltro: true,
          motivoDoDescarte: null,
          decisaoDoClaude: 0,
          justificativaDoClaude: null,
          versaoDoPrompt: null,
          criadaEmUtc: '2026-01-01T00:00:00Z'
        }
      ])
    );

    const store = TestBed.inject(AnalisesStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.analiseList()).toHaveLength(1);
  });

  it('surfaces the error on a failed load', async () => {
    dataService.getAprovadas.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(AnalisesStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeTruthy();
  });

  it('reloads the list after analisar succeeds', async () => {
    dataService.analisar.mockReturnValue(of('nova-analise-id'));

    const store = TestBed.inject(AnalisesStore);
    await TestBed.inject(ApplicationRef).whenStable();

    store.analisar({ partidaId: 'p1', mercado: 'vitoria_casa' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.analisar).toHaveBeenCalledWith({ partidaId: 'p1', mercado: 'vitoria_casa' });
    expect(dataService.getAprovadas).toHaveBeenCalledTimes(2);
  });

  it('surfaces a mutation error when analisar fails', async () => {
    dataService.analisar.mockReturnValue(throwError(() => new Error('Partidas.NotFound')));

    const store = TestBed.inject(AnalisesStore);
    await TestBed.inject(ApplicationRef).whenStable();

    store.analisar({ partidaId: 'p1', mercado: 'vitoria_casa' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.mutationError()).toBeTruthy();
  });
});
