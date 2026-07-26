import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Cotacao } from '../entities/cotacao';
import { HistoricoDeEquipe, Partida, SituacaoDaPartida } from '../entities/partida';
import { PartidaDetalheStore } from '../application/partida-detalhe.store';
import { PartidaDetalheComponent } from './partida-detalhe.component';

const PARTIDA: Partida = {
  id: 'p1',
  idExterno: 'ext-1',
  ligaId: 'liga-1',
  equipeCasaId: 'casa-1',
  equipeVisitanteId: 'fora-1',
  dataUtc: '2026-08-01T20:00:00Z',
  situacao: SituacaoDaPartida.Agendada,
  golsCasa: null,
  golsVisitante: null
};

describe('PartidaDetalheComponent', () => {
  const partidaSignal = signal<Partida | undefined>(undefined);
  const cotacaoListSignal = signal<Cotacao[]>([]);
  const historicoCasaSignal = signal<HistoricoDeEquipe | undefined>(undefined);
  const historicoVisitanteSignal = signal<HistoricoDeEquipe | undefined>(undefined);

  const storeStub = {
    partida: partidaSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    cotacaoList: cotacaoListSignal,
    historicoCasa: historicoCasaSignal,
    historicoVisitante: historicoVisitanteSignal,
    setId: vi.fn(),
    registrarCotacao: vi.fn(),
    reagendar: vi.fn(),
    registrarResultado: vi.fn()
  };

  beforeEach(() => {
    partidaSignal.set(undefined);
    cotacaoListSignal.set([]);
    historicoCasaSignal.set(undefined);
    historicoVisitanteSignal.set(undefined);
    storeStub.registrarCotacao.mockClear();
    storeStub.reagendar.mockClear();
    storeStub.registrarResultado.mockClear();

    TestBed.configureTestingModule({
      imports: [PartidaDetalheComponent],
      providers: [provideRouter([]), { provide: PartidaDetalheStore, useValue: storeStub }]
    });
  });

  it('renders the partida once loaded', () => {
    partidaSignal.set(PARTIDA);

    const fixture = TestBed.createComponent(PartidaDetalheComponent);
    fixture.componentRef.setInput('id', 'p1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('ext-1');
    expect(fixture.nativeElement.textContent).toContain('Agendada');
  });

  it('calls store.registrarResultado with the entered goals', () => {
    partidaSignal.set(PARTIDA);

    const fixture = TestBed.createComponent(PartidaDetalheComponent);
    fixture.componentRef.setInput('id', 'p1');
    fixture.detectChanges();

    const forms = Array.from(fixture.nativeElement.querySelectorAll('form')) as HTMLFormElement[];
    const resultadoForm = forms.find((form) => form.textContent?.includes('Registrar resultado'));
    const inputs = resultadoForm!.querySelectorAll('input');
    (inputs[0] as HTMLInputElement).value = '2';
    (inputs[1] as HTMLInputElement).value = '1';
    resultadoForm!.dispatchEvent(new Event('submit'));

    expect(storeStub.registrarResultado).toHaveBeenCalledWith({ golsCasa: 2, golsVisitante: 1 });
  });

  it('does not render mutation actions once the partida is encerrada', () => {
    partidaSignal.set({ ...PARTIDA, situacao: SituacaoDaPartida.Encerrada, golsCasa: 2, golsVisitante: 1 });

    const fixture = TestBed.createComponent(PartidaDetalheComponent);
    fixture.componentRef.setInput('id', 'p1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Registrar resultado');
    expect(fixture.nativeElement.textContent).toContain('Placar: 2 - 1');
  });
});
