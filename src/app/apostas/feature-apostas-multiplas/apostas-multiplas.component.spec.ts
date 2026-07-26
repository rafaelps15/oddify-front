import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ApostaMultipla } from '../entities/aposta-multipla';
import { ResultadoDaAposta } from '../entities/resultado-da-aposta';
import { Roi } from '../entities/roi';
import { Banca } from '../entities/banca';
import { ApostasMultiplasStore } from '../application/apostas-multiplas.store';
import { BancaStore } from '../application/banca.store';
import { ApostasMultiplasComponent } from './apostas-multiplas.component';

describe('ApostasMultiplasComponent', () => {
  const apostaMultiplaListSignal = signal<ApostaMultipla[]>([]);
  const roiSignal = signal<Roi | undefined>(undefined);
  const bancaSignal = signal<Banca | undefined>({ id: 'b1', saldoAtual: 1000, modoPaperTrading: true });

  const storeStub = {
    apostaMultiplaList: apostaMultiplaListSignal,
    roi: roiSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    setBancaId: vi.fn(),
    liquidar: vi.fn()
  };
  const bancaStoreStub = {
    banca: bancaSignal,
    temBancaConfigurada: signal(true),
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    criar: vi.fn(),
    usarBancaExistente: vi.fn(),
    esquecerBanca: vi.fn()
  };

  beforeEach(() => {
    apostaMultiplaListSignal.set([]);
    roiSignal.set(undefined);
    storeStub.liquidar.mockClear();

    TestBed.configureTestingModule({
      imports: [ApostasMultiplasComponent],
      providers: [
        provideRouter([]),
        { provide: ApostasMultiplasStore, useValue: storeStub },
        { provide: BancaStore, useValue: bancaStoreStub }
      ]
    });
  });

  it('renders the roi stat tiles and the multipla list', () => {
    roiSignal.set({ lucroTotal: 150, totalApostado: 500, roi: 30 });
    apostaMultiplaListSignal.set([
      {
        id: 'm1',
        bancaId: 'b1',
        oddCombinada: 2.5,
        stake: 100,
        resultado: ResultadoDaAposta.Pendente,
        lucroOuPerda: null,
        criadaEmUtc: '2026-01-01T00:00:00Z'
      }
    ]);

    const fixture = TestBed.createComponent(ApostasMultiplasComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('150');
    expect(fixture.nativeElement.textContent).toContain('2.5');
  });

  it('calls store.liquidar when the Liquidar button is clicked on a pendente row', () => {
    apostaMultiplaListSignal.set([
      {
        id: 'm1',
        bancaId: 'b1',
        oddCombinada: 2.5,
        stake: 100,
        resultado: ResultadoDaAposta.Pendente,
        lucroOuPerda: null,
        criadaEmUtc: '2026-01-01T00:00:00Z'
      }
    ]);

    const fixture = TestBed.createComponent(ApostasMultiplasComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('tbody button') as HTMLButtonElement;
    button.click();

    expect(storeStub.liquidar).toHaveBeenCalledWith('m1');
  });

  it('filters the table by resultado', () => {
    apostaMultiplaListSignal.set([
      {
        id: 'm1',
        bancaId: 'b1',
        oddCombinada: 2.5,
        stake: 100,
        resultado: ResultadoDaAposta.Pendente,
        lucroOuPerda: null,
        criadaEmUtc: '2026-01-01T00:00:00Z'
      },
      {
        id: 'm2',
        bancaId: 'b1',
        oddCombinada: 3.1,
        stake: 50,
        resultado: ResultadoDaAposta.Ganha,
        lucroOuPerda: 105,
        criadaEmUtc: '2026-01-02T00:00:00Z'
      }
    ]);

    const fixture = TestBed.createComponent(ApostasMultiplasComponent);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('.filter-bar select') as HTMLSelectElement;
    select.value = String(ResultadoDaAposta.Ganha);
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('3.1');
    expect(text).not.toContain('2.5');
  });
});
