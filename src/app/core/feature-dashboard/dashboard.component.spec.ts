import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Analise } from '../../analise/entities/analise';
import { DecisaoDoClaude } from '../../analise/entities/decisao-do-claude';
import { Partida, SituacaoDaPartida } from '../../fixtures/entities/partida';
import { Cotacao } from '../../fixtures/entities/cotacao';
import { DashboardStore } from '../application/dashboard.store';
import { MontarMultiplaStore } from '../../apostas/application/montar-multipla.store';
import { BancaStore } from '../../apostas/application/banca.store';
import { SystemStatusStore, StatusItem } from '../../shared/application/system-status.store';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  const proximasPartidasSignal = signal<Partida[]>([]);
  const oportunidadeDestaqueSignal = signal<Analise | undefined>(undefined);
  const partidaDestaqueSignal = signal<Partida | undefined>(undefined);
  const cotacoesSignal = signal<Cotacao[]>([]);
  const candidatasSignal = signal<Analise[]>([]);
  const bancaSignal = signal<{ id: string; saldoAtual: number; modoPaperTrading: boolean } | undefined>(undefined);
  const itensSignal = signal<StatusItem[]>([]);

  const dashboardStoreStub = {
    proximasPartidas: proximasPartidasSignal,
    oportunidadeDestaque: oportunidadeDestaqueSignal,
    partidaDestaque: partidaDestaqueSignal,
    nomePorEquipeId: signal(new Map<string, string>([['casa-1', 'Flamengo'], ['fora-1', 'Palmeiras']])),
    cotacoesDoMercadoDestaque: cotacoesSignal,
    loading: signal(false),
    error: signal<string | null>(null)
  };
  const montarMultiplaStoreStub = {
    candidatas: candidatasSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    montar: vi.fn()
  };
  const bancaStoreStub = {
    banca: bancaSignal,
    temBancaConfigurada: signal(false),
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    criar: vi.fn(),
    usarBancaExistente: vi.fn(),
    esquecerBanca: vi.fn()
  };
  const systemStatusStoreStub = {
    itens: itensSignal,
    loading: signal(false),
    error: signal<string | null>(null)
  };

  beforeEach(() => {
    proximasPartidasSignal.set([]);
    oportunidadeDestaqueSignal.set(undefined);
    partidaDestaqueSignal.set(undefined);
    cotacoesSignal.set([]);
    candidatasSignal.set([]);
    bancaSignal.set(undefined);
    itensSignal.set([]);

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: DashboardStore, useValue: dashboardStoreStub },
        { provide: MontarMultiplaStore, useValue: montarMultiplaStoreStub },
        { provide: BancaStore, useValue: bancaStoreStub },
        { provide: SystemStatusStore, useValue: systemStatusStoreStub }
      ]
    });
  });

  it('shows an empty state when there is no approved opportunity with a scheduled match', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhuma oportunidade aprovada');
  });

  it('renders the featured opportunity with real match/analysis data', () => {
    const analise: Analise = {
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
      justificativaDoClaude: 'Retorno de titular reforça a vantagem.',
      versaoDoPrompt: 'v1',
      criadaEmUtc: '2026-01-01T00:00:00Z'
    };
    const partida: Partida = {
      id: 'partida-1',
      idExterno: 'ext-1',
      ligaId: 'liga-1',
      equipeCasaId: 'casa-1',
      equipeVisitanteId: 'fora-1',
      dataUtc: '2026-01-05T21:30:00Z',
      situacao: SituacaoDaPartida.Agendada,
      golsCasa: null,
      golsVisitante: null
    };
    oportunidadeDestaqueSignal.set(analise);
    partidaDestaqueSignal.set(partida);
    candidatasSignal.set([analise]);

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Flamengo');
    expect(text).toContain('Palmeiras');
    expect(text).toContain('Confirma');
    expect(text).toContain('Retorno de titular reforça a vantagem.');
  });

  it('adds a candidate to the bilhete and computes the combined odd', () => {
    const analise: Analise = {
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
      criadaEmUtc: '2026-01-01T00:00:00Z'
    };
    candidatasSignal.set([analise]);

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentInstance.adicionarAoBilhete('analise-1');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('2.15');
    expect(fixture.nativeElement.querySelector('.side-title .count').textContent.trim()).toBe('1');
  });
});
