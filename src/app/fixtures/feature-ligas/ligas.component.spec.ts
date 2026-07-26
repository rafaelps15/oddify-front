import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Liga } from '../entities/liga';
import { LigasStore } from '../application/ligas.store';
import { LigasComponent } from './ligas.component';

describe('LigasComponent', () => {
  const ligaListSignal = signal<Liga[]>([]);
  const storeStub = {
    ligaList: ligaListSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    criar: vi.fn(),
    atualizarMedias: vi.fn(),
    calibrar: vi.fn()
  };

  beforeEach(() => {
    ligaListSignal.set([]);
    storeStub.criar.mockClear();
    storeStub.atualizarMedias.mockClear();
    storeStub.calibrar.mockClear();

    TestBed.configureTestingModule({
      imports: [LigasComponent],
      providers: [provideRouter([]), { provide: LigasStore, useValue: storeStub }]
    });
  });

  it('renders each liga from the store', () => {
    ligaListSignal.set([
      { id: '1', idExterno: 'ext-1', nome: 'Premier League', mediaDeGols: 2.7, fatorCasa: 1.1, calibrada: true }
    ]);
    const fixture = TestBed.createComponent(LigasComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Premier League');
    expect(fixture.nativeElement.textContent).toContain('Sim');
  });

  it('calls store.criar with the form values on submit', () => {
    const fixture = TestBed.createComponent(LigasComponent);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('form input');
    (inputs[0] as HTMLInputElement).value = 'La Liga';
    (inputs[1] as HTMLInputElement).value = 'ext-2';
    (inputs[2] as HTMLInputElement).value = '2.4';
    (inputs[3] as HTMLInputElement).value = '1.2';
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(storeStub.criar).toHaveBeenCalledWith({
      nome: 'La Liga',
      idExterno: 'ext-2',
      mediaDeGols: 2.4,
      fatorCasa: 1.2
    });
  });

  it('calls store.calibrar when the Calibrar button is clicked', () => {
    ligaListSignal.set([
      { id: '1', idExterno: 'ext-1', nome: 'Serie A', mediaDeGols: 2.5, fatorCasa: 1.15, calibrada: false }
    ]);
    const fixture = TestBed.createComponent(LigasComponent);
    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const calibrarButton = buttons.find((button) => button.textContent?.trim() === 'Calibrar');
    calibrarButton?.click();

    expect(storeStub.calibrar).toHaveBeenCalledWith('1');
  });

  it('filters the table by name or id externo as the user types', () => {
    ligaListSignal.set([
      { id: '1', idExterno: 'ext-1', nome: 'Premier League', mediaDeGols: 2.7, fatorCasa: 1.1, calibrada: true },
      { id: '2', idExterno: 'ext-2', nome: 'Serie A', mediaDeGols: 2.5, fatorCasa: 1.15, calibrada: false }
    ]);
    const fixture = TestBed.createComponent(LigasComponent);
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('app-search-input input') as HTMLInputElement;
    searchInput.value = 'serie';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Serie A');
    expect(text).not.toContain('Premier League');
  });
});
