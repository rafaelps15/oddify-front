import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { Partida, SituacaoDaPartida } from '../../fixtures/entities/partida';
import { PartidasStore } from '../../fixtures/application/partidas.store';
import { EquipeDataService } from '../../fixtures/infrastructure/equipe.data.service';
import { CotacaoDataService } from '../../fixtures/infrastructure/cotacao.data.service';
import { Analise } from '../../analise/entities/analise';
import { DecisaoDoClaude } from '../../analise/entities/decisao-do-claude';
import { AnalisesStore } from '../../analise/application/analises.store';
import { DashboardStore } from './dashboard.store';

describe('DashboardStore', () => {
  const partidaListSignal = signal<Partida[]>([]);
  const analiseListSignal = signal<Analise[]>([]);

  const partidasStoreStub = { partidaList: partidaListSignal, loading: signal(false), error: signal<string | null>(null) };
  const analisesStoreStub = { analiseList: analiseListSignal, loading: signal(false), error: signal<string | null>(null) };

  let equipeDataService: { getById: Mock };
  let cotacaoDataService: { listarPorPartida: Mock };

  const criarPartida = (overrides: Partial<Partida> = {}): Partida => ({
    id: 'partida-1',
    idExterno: 'ext-1',
    ligaId: 'liga-1',
    equipeCasaId: 'casa-1',
    equipeVisitanteId: 'fora-1',
    dataUtc: '2026-01-05T21:30:00Z',
    situacao: SituacaoDaPartida.Agendada,
    golsCasa: null,
    golsVisitante: null,
    ...overrides
  });

  const criarAnalise = (overrides: Partial<Analise> = {}): Analise => ({
    id: 'analise-1',
    partidaId: 'partida-1',
    mercado: 'vitoria_casa',
    probPoissonPura: 0.4,
    probDixonColes: 0.46,
    probImplicitaDaOdd: 0.42,
    vantagem: 0.04,
    oddDeMercado: 2.15,
    aprovadaNoFiltro: true,
    motivoDoDescarte: null,
    decisaoDoClaude: DecisaoDoClaude.Confirma,
    justificativaDoClaude: null,
    versaoDoPrompt: null,
    criadaEmUtc: '2026-01-01T00:00:00Z',
    ...overrides
  });

  beforeEach(() => {
    partidaListSignal.set([]);
    analiseListSignal.set([]);
    equipeDataService = {
      getById: vi.fn().mockReturnValue(of({ id: 'casa-1', idExterno: 'x', nome: 'Flamengo', ligaId: 'liga-1' }))
    };
    cotacaoDataService = { listarPorPartida: vi.fn().mockReturnValue(of([])) };

    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        { provide: PartidasStore, useValue: partidasStoreStub },
        { provide: AnalisesStore, useValue: analisesStoreStub },
        { provide: EquipeDataService, useValue: equipeDataService },
        { provide: CotacaoDataService, useValue: cotacaoDataService }
      ]
    });
  });

  it('picks the approved analysis with the highest vantagem among scheduled matches', async () => {
    partidaListSignal.set([
      criarPartida(),
      criarPartida({ id: 'partida-2', equipeCasaId: 'casa-2', equipeVisitanteId: 'fora-2' })
    ]);
    analiseListSignal.set([
      criarAnalise({ vantagem: 0.02 }),
      criarAnalise({ id: 'analise-2', partidaId: 'partida-2', vantagem: 0.08 })
    ]);

    const store = TestBed.inject(DashboardStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.oportunidadeDestaque()?.id).toBe('analise-2');
    expect(store.partidaDestaque()?.id).toBe('partida-2');
  });

  it('ignores approved analyses whose match already happened', async () => {
    partidaListSignal.set([criarPartida({ situacao: SituacaoDaPartida.Encerrada })]);
    analiseListSignal.set([criarAnalise()]);

    const store = TestBed.inject(DashboardStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.oportunidadeDestaque()).toBeUndefined();
  });

  it('resolves team names for the visible matches', async () => {
    partidaListSignal.set([criarPartida()]);
    equipeDataService.getById.mockImplementation((id: string) =>
      of({ id, idExterno: id, nome: id === 'casa-1' ? 'Flamengo' : 'Palmeiras', ligaId: 'liga-1' })
    );

    const store = TestBed.inject(DashboardStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.nomePorEquipeId().get('casa-1')).toBe('Flamengo');
    expect(store.nomePorEquipeId().get('fora-1')).toBe('Palmeiras');
  });

  it('surfaces the error when a dependency fails', async () => {
    partidaListSignal.set([criarPartida()]);
    equipeDataService.getById.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(DashboardStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeTruthy();
  });
});
