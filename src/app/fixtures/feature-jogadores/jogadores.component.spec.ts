import { TestBed } from '@angular/core/testing';
import { ApplicationRef, signal } from '@angular/core';
import { Jogador } from '../entities/jogador';
import { JogadoresStore } from '../application/jogadores.store';
import { JogadoresComponent } from './jogadores.component';

describe('JogadoresComponent', () => {
  const jogadorListSignal = signal<Jogador[]>([]);
  const storeStub = {
    jogadorList: jogadorListSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    mutationError: signal<string | null>(null),
    setEquipeId: vi.fn(),
    criar: vi.fn(),
    transferir: vi.fn()
  };

  beforeEach(() => {
    jogadorListSignal.set([]);
    storeStub.setEquipeId.mockClear();
    storeStub.criar.mockClear();
    storeStub.transferir.mockClear();

    TestBed.configureTestingModule({
      imports: [JogadoresComponent],
      providers: [{ provide: JogadoresStore, useValue: storeStub }]
    });
  });

  it('sets the equipeId on the store from the route input', async () => {
    const fixture = TestBed.createComponent(JogadoresComponent);
    fixture.componentRef.setInput('equipeId', 'equipe-1');
    fixture.detectChanges();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(storeStub.setEquipeId).toHaveBeenCalledWith('equipe-1');
  });

  it('renders each jogador from the store', () => {
    jogadorListSignal.set([{ id: '1', idExterno: 'j1', equipeId: 'equipe-1', nome: 'Jogador A', posicao: 'ATA' }]);

    const fixture = TestBed.createComponent(JogadoresComponent);
    fixture.componentRef.setInput('equipeId', 'equipe-1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Jogador A');
  });

  it('calls store.transferir with the target equipe id', () => {
    jogadorListSignal.set([{ id: '1', idExterno: 'j1', equipeId: 'equipe-1', nome: 'Jogador A', posicao: 'ATA' }]);

    const fixture = TestBed.createComponent(JogadoresComponent);
    fixture.componentRef.setInput('equipeId', 'equipe-1');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('tbody form input') as HTMLInputElement;
    input.value = 'equipe-2';
    fixture.nativeElement.querySelector('tbody form').dispatchEvent(new Event('submit'));

    expect(storeStub.transferir).toHaveBeenCalledWith('1', 'equipe-2');
  });

  it('filters the table by name, id externo or posição as the user types', () => {
    jogadorListSignal.set([
      { id: '1', idExterno: 'j1', equipeId: 'equipe-1', nome: 'Jogador A', posicao: 'ATA' },
      { id: '2', idExterno: 'j2', equipeId: 'equipe-1', nome: 'Jogador B', posicao: 'GOL' }
    ]);
    const fixture = TestBed.createComponent(JogadoresComponent);
    fixture.componentRef.setInput('equipeId', 'equipe-1');
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('app-search-input input') as HTMLInputElement;
    searchInput.value = 'gol';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Jogador B');
    expect(text).not.toContain('Jogador A');
  });
});
