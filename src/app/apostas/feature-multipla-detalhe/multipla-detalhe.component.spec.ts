import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ApostaMultipla } from '../entities/aposta-multipla';
import { ResultadoDaAposta } from '../entities/resultado-da-aposta';
import { MultiplaDetalheStore } from '../application/multipla-detalhe.store';
import { MultiplaDetalheComponent } from './multipla-detalhe.component';

const MULTIPLA: ApostaMultipla = {
  id: 'm1',
  bancaId: 'b1',
  oddCombinada: 2.5,
  stake: 100,
  resultado: ResultadoDaAposta.Pendente,
  lucroOuPerda: null,
  criadaEmUtc: '2026-01-01T00:00:00Z'
};

describe('MultiplaDetalheComponent', () => {
  const multiplaSignal = signal<ApostaMultipla | undefined>(undefined);
  const storeStub = {
    multipla: multiplaSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    setId: vi.fn(),
    liquidar: vi.fn()
  };

  beforeEach(() => {
    multiplaSignal.set(undefined);
    storeStub.liquidar.mockClear();

    TestBed.configureTestingModule({
      imports: [MultiplaDetalheComponent],
      providers: [provideRouter([]), { provide: MultiplaDetalheStore, useValue: storeStub }]
    });
  });

  it('shows the Liquidar button only when resultado is Pendente', () => {
    multiplaSignal.set(MULTIPLA);

    const fixture = TestBed.createComponent(MultiplaDetalheComponent);
    fixture.componentRef.setInput('id', 'm1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Liquidar');
  });

  it('hides the Liquidar button once the multipla is settled', () => {
    multiplaSignal.set({ ...MULTIPLA, resultado: ResultadoDaAposta.Ganha, lucroOuPerda: 150 });

    const fixture = TestBed.createComponent(MultiplaDetalheComponent);
    fixture.componentRef.setInput('id', 'm1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Liquidar');
  });

  it('calls store.liquidar when the button is clicked', () => {
    multiplaSignal.set(MULTIPLA);

    const fixture = TestBed.createComponent(MultiplaDetalheComponent);
    fixture.componentRef.setInput('id', 'm1');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();

    expect(storeStub.liquidar).toHaveBeenCalled();
  });
});
