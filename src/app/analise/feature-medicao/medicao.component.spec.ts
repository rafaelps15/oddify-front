import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Medicao } from '../entities/medicao';
import { MedicaoStore } from '../application/medicao.store';
import { MedicaoComponent } from './medicao.component';

describe('MedicaoComponent', () => {
  const medicaoSignal = signal<Medicao | undefined>(undefined);
  const storeStub = {
    medicao: medicaoSignal,
    loading: signal(false),
    error: signal<string | null>(null)
  };

  beforeEach(() => {
    medicaoSignal.set(undefined);

    TestBed.configureTestingModule({
      imports: [MedicaoComponent],
      providers: [{ provide: MedicaoStore, useValue: storeStub }]
    });
  });

  it('renders the stat tiles and Brier rows once loaded', () => {
    medicaoSignal.set({
      amostraTotal: 20,
      brierPoissonPuro: 0.24,
      brierDixonColes: 0.21,
      amostraPosClaude: 8,
      brierPosClaude: 0.18
    });

    const fixture = TestBed.createComponent(MedicaoComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('20');
    expect(text).toContain('Poisson pura');
    expect(text).toContain('Dixon-Coles pós-Claude');
  });

  it('shows "sem amostra ainda" when brierPosClaude is null', () => {
    medicaoSignal.set({
      amostraTotal: 20,
      brierPoissonPuro: 0.24,
      brierDixonColes: 0.21,
      amostraPosClaude: 0,
      brierPosClaude: null
    });

    const fixture = TestBed.createComponent(MedicaoComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('sem amostra ainda');
  });
});
