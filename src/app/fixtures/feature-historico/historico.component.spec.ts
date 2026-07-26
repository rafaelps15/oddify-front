import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Partida, SituacaoDaPartida } from '../entities/partida';
import { PartidasStore } from '../application/partidas.store';
import { HistoricoComponent } from './historico.component';

describe('HistoricoComponent', () => {
  const partidaListSignal = signal<Partida[]>([]);

  const partidasStoreStub = {
    partidaList: partidaListSignal,
    loading: signal(false),
    error: signal<string | null>(null)
  };

  const partida = (overrides: Partial<Partida>): Partida => ({
    id: 'p1',
    idExterno: 'ext-1',
    ligaId: 'liga-1',
    equipeCasaId: 'c1',
    equipeVisitanteId: 'v1',
    dataUtc: '2026-08-01T20:00:00Z',
    situacao: SituacaoDaPartida.Agendada,
    golsCasa: null,
    golsVisitante: null,
    ...overrides
  });

  beforeEach(() => {
    partidaListSignal.set([]);
    TestBed.configureTestingModule({
      imports: [HistoricoComponent],
      providers: [provideRouter([]), { provide: PartidasStore, useValue: partidasStoreStub }]
    });
  });

  it('shows only encerrada/liquidada partidas, most recent first', () => {
    partidaListSignal.set([
      partida({ id: 'agendada', idExterno: 'ext-agendada', situacao: SituacaoDaPartida.Agendada }),
      partida({
        id: 'antiga',
        idExterno: 'ext-antiga',
        situacao: SituacaoDaPartida.Encerrada,
        dataUtc: '2026-07-01T20:00:00Z'
      }),
      partida({
        id: 'recente',
        idExterno: 'ext-recente',
        situacao: SituacaoDaPartida.Liquidada,
        dataUtc: '2026-08-05T20:00:00Z'
      })
    ]);

    const fixture = TestBed.createComponent(HistoricoComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).not.toContain('ext-agendada');
    const posicaoRecente = text.indexOf('ext-recente');
    const posicaoAntiga = text.indexOf('ext-antiga');
    expect(posicaoRecente).toBeGreaterThanOrEqual(0);
    expect(posicaoAntiga).toBeGreaterThan(posicaoRecente);
  });

  it('shows an empty state when there is nothing finished yet', () => {
    partidaListSignal.set([partida({ situacao: SituacaoDaPartida.Agendada })]);

    const fixture = TestBed.createComponent(HistoricoComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhuma partida encerrada ou liquidada ainda.');
  });
});
