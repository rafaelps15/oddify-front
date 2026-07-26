import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Analise } from '../entities/analise';
import { DecisaoDoClaude } from '../entities/decisao-do-claude';
import { AnaliseDetalheStore } from '../application/analise-detalhe.store';
import { AnaliseDetalheComponent } from './analise-detalhe.component';

const ANALISE: Analise = {
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
  decisaoDoClaude: DecisaoDoClaude.NaoAvaliada,
  justificativaDoClaude: null,
  versaoDoPrompt: null,
  criadaEmUtc: '2026-01-01T00:00:00Z'
};

describe('AnaliseDetalheComponent', () => {
  const analiseSignal = signal<Analise | undefined>(undefined);
  const storeStub = {
    analise: analiseSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    setId: vi.fn(),
    avaliarComClaude: vi.fn()
  };

  beforeEach(() => {
    analiseSignal.set(undefined);
    storeStub.avaliarComClaude.mockClear();

    TestBed.configureTestingModule({
      imports: [AnaliseDetalheComponent],
      providers: [provideRouter([]), { provide: AnaliseDetalheStore, useValue: storeStub }]
    });
  });

  it('shows the "avaliar com Claude" action only for an approved, not-yet-evaluated análise', () => {
    analiseSignal.set(ANALISE);

    const fixture = TestBed.createComponent(AnaliseDetalheComponent);
    fixture.componentRef.setInput('id', 'a1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Avaliar com Claude');
  });

  it('hides the action once a decision has already been made', () => {
    analiseSignal.set({ ...ANALISE, decisaoDoClaude: DecisaoDoClaude.Confirma });

    const fixture = TestBed.createComponent(AnaliseDetalheComponent);
    fixture.componentRef.setInput('id', 'a1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Avaliar com Claude');
  });

  it('calls store.avaliarComClaude with the entered context', () => {
    analiseSignal.set(ANALISE);

    const fixture = TestBed.createComponent(AnaliseDetalheComponent);
    fixture.componentRef.setInput('id', 'a1');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'time reserva jogando';
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(storeStub.avaliarComClaude).toHaveBeenCalledWith({ contextoAdicional: 'time reserva jogando' });
  });
});
