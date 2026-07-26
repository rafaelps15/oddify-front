import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Liga } from '../entities/liga';
import { Equipe } from '../entities/equipe';
import { LigasStore } from '../application/ligas.store';
import { EquipesStore } from '../application/equipes.store';
import { JogadoresIndexComponent } from './jogadores-index.component';

describe('JogadoresIndexComponent', () => {
  const ligaListSignal = signal<Liga[]>([]);
  const equipeListSignal = signal<Equipe[]>([]);

  const ligasStoreStub = {
    ligaList: ligaListSignal,
    loading: signal(false),
    error: signal<string | null>(null)
  };
  const equipesStoreStub = {
    equipeList: equipeListSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    setLigaId: vi.fn()
  };

  beforeEach(() => {
    ligaListSignal.set([{ id: 'liga-1', idExterno: 'l1', nome: 'Premier League', mediaDeGols: 2.7, fatorCasa: 1.1, calibrada: true }]);
    equipeListSignal.set([]);
    equipesStoreStub.setLigaId.mockClear();

    TestBed.configureTestingModule({
      imports: [JogadoresIndexComponent],
      providers: [
        provideRouter([]),
        { provide: LigasStore, useValue: ligasStoreStub },
        { provide: EquipesStore, useValue: equipesStoreStub }
      ]
    });
  });

  it('asks the equipes store to filter by liga once one is picked', () => {
    const fixture = TestBed.createComponent(JogadoresIndexComponent);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'liga-1';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(equipesStoreStub.setLigaId).toHaveBeenCalledWith('liga-1');
  });

  it('links each equipe to its jogadores screen', () => {
    equipeListSignal.set([{ id: 'equipe-1', idExterno: 'e1', nome: 'Time A', ligaId: 'liga-1' }]);

    const fixture = TestBed.createComponent(JogadoresIndexComponent);
    fixture.componentInstance['ligaId'].set('liga-1');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a.stat-tile') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Time A');
  });
});
