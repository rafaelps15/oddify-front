import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { PartidaDataService } from '../infrastructure/partida.data.service';
import { CotacaoDataService } from '../infrastructure/cotacao.data.service';
import { SituacaoDaPartida } from '../entities/partida';
import { PartidaDetalheStore } from './partida-detalhe.store';

const PARTIDA = {
  id: 'p1',
  idExterno: 'ext-1',
  ligaId: 'liga-1',
  equipeCasaId: 'casa-1',
  equipeVisitanteId: 'fora-1',
  dataUtc: '2026-08-01T20:00:00Z',
  situacao: SituacaoDaPartida.Agendada,
  golsCasa: null,
  golsVisitante: null
};

describe('PartidaDetalheStore', () => {
  let partidaDataService: {
    criar: Mock;
    getById: Mock;
    listar: Mock;
    reagendar: Mock;
    registrarResultado: Mock;
    getHistoricoRecente: Mock;
  };
  let cotacaoDataService: { registrar: Mock; listarPorPartida: Mock };

  beforeEach(() => {
    partidaDataService = {
      criar: vi.fn(),
      getById: vi.fn().mockReturnValue(of(PARTIDA)),
      listar: vi.fn(),
      reagendar: vi.fn(),
      registrarResultado: vi.fn(),
      getHistoricoRecente: vi.fn().mockReturnValue(of({ amostraDeJogos: 5, mediaGolsFeitos: 1.4, mediaGolsSofridos: 0.8 }))
    };
    cotacaoDataService = {
      registrar: vi.fn(),
      listarPorPartida: vi.fn().mockReturnValue(of([]))
    };

    TestBed.configureTestingModule({
      providers: [
        PartidaDetalheStore,
        { provide: PartidaDataService, useValue: partidaDataService },
        { provide: CotacaoDataService, useValue: cotacaoDataService }
      ]
    });
  });

  it('loads the partida, its cotações and both teams’ histórico once an id is set', async () => {
    cotacaoDataService.listarPorPartida.mockReturnValue(
      of([{ id: 'c1', partidaId: 'p1', mercado: 'vitoria_casa', odd: 1.5, casa: 'Bet X', coletadaEmUtc: '2026-07-01T00:00:00Z' }])
    );

    const store = TestBed.inject(PartidaDetalheStore);
    store.setId('p1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.partida()?.idExterno).toBe('ext-1');
    expect(store.cotacaoList()).toHaveLength(1);
    expect(partidaDataService.getHistoricoRecente).toHaveBeenCalledWith('casa-1', 5);
    expect(partidaDataService.getHistoricoRecente).toHaveBeenCalledWith('fora-1', 5);
    expect(store.historicoCasa()?.amostraDeJogos).toBe(5);
  });

  it('surfaces the error when loading the partida fails', async () => {
    partidaDataService.getById.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(PartidaDetalheStore);
    store.setId('p1');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeTruthy();
  });

  it('reloads the cotações after registering a new one', async () => {
    cotacaoDataService.registrar.mockReturnValue(of('nova-cotacao-id'));

    const store = TestBed.inject(PartidaDetalheStore);
    store.setId('p1');
    await TestBed.inject(ApplicationRef).whenStable();

    store.registrarCotacao({ mercado: 'over_2_5', odd: 1.6, casa: 'Bet X', coletadaEmUtc: '2026-07-02T00:00:00Z' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(cotacaoDataService.registrar).toHaveBeenCalledWith({
      mercado: 'over_2_5',
      odd: 1.6,
      casa: 'Bet X',
      coletadaEmUtc: '2026-07-02T00:00:00Z',
      partidaId: 'p1'
    });
    expect(cotacaoDataService.listarPorPartida).toHaveBeenCalledTimes(2);
  });

  it('reloads the partida after registrar-resultado succeeds', async () => {
    partidaDataService.registrarResultado.mockReturnValue(of(undefined));

    const store = TestBed.inject(PartidaDetalheStore);
    store.setId('p1');
    await TestBed.inject(ApplicationRef).whenStable();

    store.registrarResultado({ golsCasa: 2, golsVisitante: 1 });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(partidaDataService.registrarResultado).toHaveBeenCalledWith('p1', { golsCasa: 2, golsVisitante: 1 });
    expect(partidaDataService.getById).toHaveBeenCalledTimes(2);
  });

  it('surfaces a mutation error when reagendar fails', async () => {
    partidaDataService.reagendar.mockReturnValue(throwError(() => new Error('Partidas.JaEncerrada')));

    const store = TestBed.inject(PartidaDetalheStore);
    store.setId('p1');
    await TestBed.inject(ApplicationRef).whenStable();

    store.reagendar('2026-08-05T20:00:00Z');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.mutationError()).toBeTruthy();
  });
});
