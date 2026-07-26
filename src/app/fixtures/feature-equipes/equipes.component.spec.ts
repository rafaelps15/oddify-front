import { TestBed } from '@angular/core/testing';
import { ApplicationRef, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Equipe } from '../entities/equipe';
import { EquipesStore } from '../application/equipes.store';
import { EquipesComponent } from './equipes.component';

describe('EquipesComponent', () => {
  const equipeListSignal = signal<Equipe[]>([]);
  const storeStub = {
    equipeList: equipeListSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    setLigaId: vi.fn(),
    criar: vi.fn(),
    renomear: vi.fn()
  };

  beforeEach(() => {
    equipeListSignal.set([]);
    storeStub.setLigaId.mockClear();
    storeStub.criar.mockClear();
    storeStub.renomear.mockClear();

    TestBed.configureTestingModule({
      imports: [EquipesComponent],
      providers: [provideRouter([]), { provide: EquipesStore, useValue: storeStub }]
    });
  });

  it('sets the ligaId on the store from the route input', async () => {
    const fixture = TestBed.createComponent(EquipesComponent);
    fixture.componentRef.setInput('ligaId', 'liga-1');
    fixture.detectChanges();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(storeStub.setLigaId).toHaveBeenCalledWith('liga-1');
  });

  it('renders each equipe from the store', () => {
    equipeListSignal.set([{ id: '1', idExterno: 'e1', nome: 'Time A', ligaId: 'liga-1' }]);

    const fixture = TestBed.createComponent(EquipesComponent);
    fixture.componentRef.setInput('ligaId', 'liga-1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Time A');
  });

  it('calls store.criar with the ligaId from the route on submit', () => {
    const fixture = TestBed.createComponent(EquipesComponent);
    fixture.componentRef.setInput('ligaId', 'liga-1');
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('form input');
    (inputs[0] as HTMLInputElement).value = 'Time B';
    (inputs[1] as HTMLInputElement).value = 'e2';
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(storeStub.criar).toHaveBeenCalledWith({ idExterno: 'e2', nome: 'Time B', ligaId: 'liga-1' });
  });

  it('filters the table by name or id externo as the user types', () => {
    equipeListSignal.set([
      { id: '1', idExterno: 'e1', nome: 'Time A', ligaId: 'liga-1' },
      { id: '2', idExterno: 'e2', nome: 'Time B', ligaId: 'liga-1' }
    ]);
    const fixture = TestBed.createComponent(EquipesComponent);
    fixture.componentRef.setInput('ligaId', 'liga-1');
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('app-search-input input') as HTMLInputElement;
    searchInput.value = 'Time B';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Time B');
    expect(text).not.toContain('Time A');
  });
});
