import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { AnaliseDataService } from '../infrastructure/analise.data.service';
import { AnaliseDetalheStore } from './analise-detalhe.store';

const ANALISE = {
  id: 'a1',
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
};

describe('AnaliseDetalheStore', () => {
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
      getById: vi.fn().mockReturnValue(of(ANALISE)),
      getAprovadas: vi.fn(),
      getMedicao: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [AnaliseDetalheStore, { provide: AnaliseDataService, useValue: dataService }]
    });
  });

  it('loads the análise once an id is set', async () => {
    const store = TestBed.inject(AnaliseDetalheStore);
    store.setId('a1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.getById).toHaveBeenCalledWith('a1');
    expect(store.analise()?.mercado).toBe('vitoria_casa');
  });

  it('reloads the análise after avaliarComClaude, regardless of the 200 response', async () => {
    dataService.avaliarComClaude.mockReturnValue(of(undefined));

    const store = TestBed.inject(AnaliseDetalheStore);
    store.setId('a1');
    await TestBed.inject(ApplicationRef).whenStable();

    store.avaliarComClaude({ contextoAdicional: 'contexto' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dataService.avaliarComClaude).toHaveBeenCalledWith('a1', { contextoAdicional: 'contexto' });
    expect(dataService.getById).toHaveBeenCalledTimes(2);
  });

  it('surfaces a mutation error when avaliarComClaude fails', async () => {
    dataService.avaliarComClaude.mockReturnValue(throwError(() => new Error('Analises.NaoAprovadaNoFiltro')));

    const store = TestBed.inject(AnaliseDetalheStore);
    store.setId('a1');
    await TestBed.inject(ApplicationRef).whenStable();

    store.avaliarComClaude({});
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.mutationError()).toBeTruthy();
  });
});
