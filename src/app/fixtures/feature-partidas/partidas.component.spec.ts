import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Partida, SituacaoDaPartida } from '../entities/partida';
import { Liga } from '../entities/liga';
import { PartidasStore } from '../application/partidas.store';
import { LigasStore } from '../application/ligas.store';
import { PartidasComponent } from './partidas.component';

describe('PartidasComponent', () => {
  const partidaListSignal = signal<Partida[]>([]);
  const ligaListSignal = signal<Liga[]>([]);

  const partidasStoreStub = {
    partidaList: partidaListSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    filtrarPorLiga: vi.fn(),
    criar: vi.fn()
  };
  const ligasStoreStub = {
    ligaList: ligaListSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    criar: vi.fn(),
    atualizarMedias: vi.fn(),
    calibrar: vi.fn()
  };

  beforeEach(() => {
    partidaListSignal.set([]);
    ligaListSignal.set([{ id: 'liga-1', idExterno: 'l1', nome: 'Premier League', mediaDeGols: 2.7, fatorCasa: 1.1, calibrada: true }]);
    partidasStoreStub.filtrarPorLiga.mockClear();
    partidasStoreStub.criar.mockClear();

    TestBed.configureTestingModule({
      imports: [PartidasComponent],
      providers: [
        provideRouter([]),
        { provide: PartidasStore, useValue: partidasStoreStub },
        { provide: LigasStore, useValue: ligasStoreStub }
      ]
    });
  });

  it('renders each partida from the store', () => {
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

    const fixture = TestBed.createComponent(PartidasComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('ext-1');
    expect(fixture.nativeElement.textContent).toContain('Agendada');
  });

  it('calls store.filtrarPorLiga when the liga filter changes', () => {
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

    const fixture = TestBed.createComponent(PartidasComponent);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('.filter-bar label select') as HTMLSelectElement;
    select.value = 'liga-1';
    select.dispatchEvent(new Event('change'));

    expect(partidasStoreStub.filtrarPorLiga).toHaveBeenCalledWith('liga-1');
  });

  it('filters the table client-side by id externo and by situação', () => {
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
      },
      {
        id: 'p2',
        idExterno: 'ext-2',
        ligaId: 'liga-1',
        equipeCasaId: 'c1',
        equipeVisitanteId: 'v1',
        dataUtc: '2026-08-02T20:00:00Z',
        situacao: SituacaoDaPartida.Encerrada,
        golsCasa: 2,
        golsVisitante: 1
      }
    ]);

    const fixture = TestBed.createComponent(PartidasComponent);
    fixture.detectChanges();

    const situacaoSelect = fixture.nativeElement.querySelectorAll('.filter-bar label select')[1] as HTMLSelectElement;
    situacaoSelect.value = String(SituacaoDaPartida.Encerrada);
    situacaoSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('ext-2');
    expect(text).not.toContain('ext-1');
  });
});
