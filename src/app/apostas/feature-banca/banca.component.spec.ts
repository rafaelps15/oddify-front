import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Banca } from '../entities/banca';
import { BancaStore } from '../application/banca.store';
import { BancaComponent } from './banca.component';

describe('BancaComponent', () => {
  const bancaSignal = signal<Banca | undefined>(undefined);
  const storeStub = {
    banca: bancaSignal,
    temBancaConfigurada: signal(false),
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    criar: vi.fn(),
    usarBancaExistente: vi.fn(),
    esquecerBanca: vi.fn()
  };

  beforeEach(() => {
    bancaSignal.set(undefined);
    storeStub.criar.mockClear();
    storeStub.usarBancaExistente.mockClear();
    storeStub.esquecerBanca.mockClear();

    TestBed.configureTestingModule({
      imports: [BancaComponent],
      providers: [{ provide: BancaStore, useValue: storeStub }]
    });
  });

  it('shows the criar/usar-existente forms when there is no banca', () => {
    const fixture = TestBed.createComponent(BancaComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Criar banca');
    expect(fixture.nativeElement.textContent).toContain('Usar banca existente');
  });

  it('calls store.criar with the form values', () => {
    const fixture = TestBed.createComponent(BancaComponent);
    fixture.detectChanges();

    const saldoInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    saldoInput.value = '1000';
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(storeStub.criar).toHaveBeenCalledWith({ saldoInicial: 1000, modoPaperTrading: true });
  });

  it('shows the banca details and a trocar-banca button when a banca is loaded', () => {
    bancaSignal.set({ id: 'b1', saldoAtual: 1000, modoPaperTrading: true });

    const fixture = TestBed.createComponent(BancaComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('1000');
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(storeStub.esquecerBanca).toHaveBeenCalled();
  });
});
