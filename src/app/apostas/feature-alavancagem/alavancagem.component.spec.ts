import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Banca } from '../entities/banca';
import { BancaStore } from '../application/banca.store';
import { AlavancagemComponent } from './alavancagem.component';

describe('AlavancagemComponent', () => {
  const bancaSignal = signal<Banca | undefined>(undefined);

  const bancaStoreStub = {
    banca: bancaSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    temBancaConfigurada: signal(false),
    criar: vi.fn(),
    usarBancaExistente: vi.fn(),
    esquecerBanca: vi.fn()
  };

  beforeEach(() => {
    bancaSignal.set(undefined);
    TestBed.configureTestingModule({
      imports: [AlavancagemComponent],
      providers: [{ provide: BancaStore, useValue: bancaStoreStub }]
    });
  });

  it('computes the fractional Kelly stake for a positive-edge bet', () => {
    const fixture = TestBed.createComponent(AlavancagemComponent);
    const component = fixture.componentInstance;
    component['odd'].set(2);
    component['probabilidadePercent'].set(55);
    component['fracaoDeKelly'].set(0.5);
    component['banca'].set(1000);
    fixture.detectChanges();

    expect(component['probabilidadeImplicita']()).toBeCloseTo(50, 5);
    expect(component['edge']()).toBeCloseTo(5, 5);
    expect(component['kellyFracionado']()).toBeCloseTo(0.05, 5);
    expect(component['stakeSugerido']()).toBeCloseTo(50, 5);
    expect(component['temValorPositivo']()).toBe(true);
  });

  it('recommends no stake when there is no positive edge', () => {
    const fixture = TestBed.createComponent(AlavancagemComponent);
    const component = fixture.componentInstance;
    component['odd'].set(1.5);
    component['probabilidadePercent'].set(40);
    fixture.detectChanges();

    expect(component['temValorPositivo']()).toBe(false);
    expect(component['stakeSugerido']()).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Sem valor esperado positivo');
  });

  it('prefills the bankroll from the active banca once it loads', () => {
    bancaSignal.set({ id: 'b1', saldoAtual: 2500, modoPaperTrading: false });

    const fixture = TestBed.createComponent(AlavancagemComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance['banca']()).toBe(2500);
  });
});
