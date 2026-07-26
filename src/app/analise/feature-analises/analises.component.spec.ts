import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Analise } from '../entities/analise';
import { AnalisesStore } from '../application/analises.store';
import { PartidasStore, Partida, SituacaoDaPartida } from '../../fixtures';
import { AnalisesComponent } from './analises.component';

describe('AnalisesComponent', () => {
  const analiseListSignal = signal<Analise[]>([]);
  const partidaListSignal = signal<Partida[]>([]);

  const analisesStoreStub = {
    analiseList: analiseListSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    analisar: vi.fn()
  };
  const partidasStoreStub = {
    partidaList: partidaListSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    filtrarPorLiga: vi.fn(),
    criar: vi.fn()
  };

  beforeEach(() => {
    analiseListSignal.set([]);
    partidaListSignal.set([
      {
        id: 'p1',
        idExterno: 'ext-1',
        ligaId: 'liga-1',
        equipeCasaId: 'c1',
        equipeVisitanteId: 'v1',
        dataUtc: '2026-08-01T20:00:00Z',
        situacao: SituacaoDaPartida.Agendada,
        golsCasa: null,
        golsVisitante: null
      }
    ]);
    analisesStoreStub.analisar.mockClear();

    TestBed.configureTestingModule({
      imports: [AnalisesComponent],
      providers: [
        provideRouter([]),
        { provide: AnalisesStore, useValue: analisesStoreStub },
        { provide: PartidasStore, useValue: partidasStoreStub }
      ]
    });
  });

  it('renders each análise from the store', () => {
    analiseListSignal.set([
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
    ]);

    const fixture = TestBed.createComponent(AnalisesComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('vitoria_casa');
  });

  it('calls store.analisar with the selected partida and mercado', () => {
    const fixture = TestBed.createComponent(AnalisesComponent);
    fixture.detectChanges();

    const partidaSelect = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    partidaSelect.value = 'p1';
    const mercadoSelect = fixture.nativeElement.querySelectorAll('select')[1] as HTMLSelectElement;
    mercadoSelect.value = 'vitoria_casa';
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(analisesStoreStub.analisar).toHaveBeenCalledWith({ partidaId: 'p1', mercado: 'vitoria_casa' });
  });

  it('filters the table by mercado and by decisão do Claude', () => {
    analiseListSignal.set([
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
        decisaoDoClaude: 1,
        justificativaDoClaude: null,
        versaoDoPrompt: null,
        criadaEmUtc: '2026-01-01T00:00:00Z'
      },
      {
        id: '2',
        partidaId: 'p1',
        mercado: 'empate',
        probPoissonPura: 0.3,
        probDixonColes: 0.31,
        probImplicitaDaOdd: 0.25,
        vantagem: 0.06,
        oddDeMercado: 3.2,
        aprovadaNoFiltro: true,
        motivoDoDescarte: null,
        decisaoDoClaude: 3,
        justificativaDoClaude: null,
        versaoDoPrompt: null,
        criadaEmUtc: '2026-01-01T00:00:00Z'
      }
    ]);

    const fixture = TestBed.createComponent(AnalisesComponent);
    fixture.detectChanges();

    const decisaoSelect = fixture.nativeElement.querySelector('.filter-bar label select') as HTMLSelectElement;
    decisaoSelect.value = '3';
    decisaoSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('table').textContent;
    expect(text).toContain('empate');
    expect(text).not.toContain('vitoria_casa');
  });
});
