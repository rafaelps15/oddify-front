import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { AnaliseDataService, DecisaoDoClaude } from '../../analise';
import { ApostaMultiplaDataService } from '../infrastructure/aposta-multipla.data.service';
import { MontarMultiplaStore } from './montar-multipla.store';

function analise(id: string, decisaoDoClaude: DecisaoDoClaude) {
  return {
    id,
    partidaId: 'p1',
    mercado: 'vitoria_casa',
    probPoissonPura: 0.5,
    probDixonColes: 0.52,
    probImplicitaDaOdd: 0.4,
    vantagem: 0.12,
    oddDeMercado: 1.5,
    aprovadaNoFiltro: true,
    motivoDoDescarte: null,
    decisaoDoClaude,
    justificativaDoClaude: null,
    versaoDoPrompt: null,
    criadaEmUtc: '2026-01-01T00:00:00Z'
  };
}

describe('MontarMultiplaStore', () => {
  let analiseDataService: {
    analisar: Mock;
    avaliarComClaude: Mock;
    getById: Mock;
    getAprovadas: Mock;
    getMedicao: Mock;
  };
  let apostaMultiplaDataService: { getById: Mock; listar: Mock; getRoi: Mock; montar: Mock; liquidar: Mock };

  beforeEach(() => {
    analiseDataService = {
      analisar: vi.fn(),
      avaliarComClaude: vi.fn(),
      getById: vi.fn(),
      getAprovadas: vi.fn().mockReturnValue(of([])),
      getMedicao: vi.fn()
    };
    apostaMultiplaDataService = { getById: vi.fn(), listar: vi.fn(), getRoi: vi.fn(), montar: vi.fn(), liquidar: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        MontarMultiplaStore,
        { provide: AnaliseDataService, useValue: analiseDataService },
        { provide: ApostaMultiplaDataService, useValue: apostaMultiplaDataService }
      ]
    });
  });

  it('only exposes análises with decisaoDoClaude Confirma or Reduz as candidatas', async () => {
    analiseDataService.getAprovadas.mockReturnValue(
      of([
        analise('a1', DecisaoDoClaude.Confirma),
        analise('a2', DecisaoDoClaude.Reduz),
        analise('a3', DecisaoDoClaude.NaoAvaliada),
        analise('a4', DecisaoDoClaude.Veta)
      ])
    );

    const store = TestBed.inject(MontarMultiplaStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.candidatas().map((a) => a.id)).toEqual(['a1', 'a2']);
  });

  it('exposes the new multipla id after montar succeeds', async () => {
    apostaMultiplaDataService.montar.mockReturnValue(of('multipla-1'));

    const store = TestBed.inject(MontarMultiplaStore);
    store.montar({ bancaId: 'banca-1', analiseIds: ['a1', 'a2'] });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(apostaMultiplaDataService.montar).toHaveBeenCalledWith({ bancaId: 'banca-1', analiseIds: ['a1', 'a2'] });
    expect(store.multiplaCriadaId()).toBe('multipla-1');
  });

  it('surfaces a mutation error when montar fails', async () => {
    apostaMultiplaDataService.montar.mockReturnValue(throwError(() => new Error('ApostasMultiplas.StakeNulo')));

    const store = TestBed.inject(MontarMultiplaStore);
    store.montar({ bancaId: 'banca-1', analiseIds: ['a1', 'a2'] });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.mutationError()).toBeTruthy();
    expect(store.multiplaCriadaId()).toBeNull();
  });
});
