import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Analise, DecisaoDoClaude } from '../../analise';
import { Banca } from '../entities/banca';
import { MontarMultiplaStore } from '../application/montar-multipla.store';
import { BancaStore } from '../application/banca.store';
import { MontarMultiplaComponent } from './montar-multipla.component';

function analise(id: string): Analise {
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
    decisaoDoClaude: DecisaoDoClaude.Confirma,
    justificativaDoClaude: null,
    versaoDoPrompt: null,
    criadaEmUtc: '2026-01-01T00:00:00Z'
  };
}

describe('MontarMultiplaComponent', () => {
  const candidatasSignal = signal<Analise[]>([]);
  const storeStub = {
    candidatas: candidatasSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    multiplaCriadaId: signal<string | null>(null),
    montar: vi.fn()
  };
  const bancaStoreStub = {
    banca: signal<Banca | undefined>({ id: 'b1', saldoAtual: 1000, modoPaperTrading: true })
  };

  beforeEach(() => {
    candidatasSignal.set([analise('a1'), analise('a2'), analise('a3')]);
    storeStub.montar.mockClear();

    TestBed.configureTestingModule({
      imports: [MontarMultiplaComponent],
      providers: [
        provideRouter([]),
        { provide: MontarMultiplaStore, useValue: storeStub },
        { provide: BancaStore, useValue: bancaStoreStub }
      ]
    });
  });

  it('disables Montar múltipla with fewer than 2 selections', () => {
    const fixture = TestBed.createComponent(MontarMultiplaComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('calls store.montar with the banca and selected análises', () => {
    const fixture = TestBed.createComponent(MontarMultiplaComponent);
    fixture.detectChanges();

    const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes[0].checked = true;
    checkboxes[0].dispatchEvent(new Event('change'));
    checkboxes[1].checked = true;
    checkboxes[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(storeStub.montar).toHaveBeenCalledWith({ bancaId: 'b1', analiseIds: ['a1', 'a2'] });
  });
});
