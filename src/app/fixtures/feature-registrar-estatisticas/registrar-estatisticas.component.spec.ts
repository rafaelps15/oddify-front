import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RegistrarEstatisticasStore } from '../application/registrar-estatisticas.store';
import { RegistrarEstatisticasComponent } from './registrar-estatisticas.component';

describe('RegistrarEstatisticasComponent', () => {
  const storeStub = {
    equipeRegistrada: signal(false),
    jogadorRegistrado: signal(false),
    mutationError: signal<string | null>(null),
    registrarEquipe: vi.fn(),
    registrarJogador: vi.fn()
  };

  beforeEach(() => {
    storeStub.equipeRegistrada.set(false);
    storeStub.jogadorRegistrado.set(false);
    storeStub.registrarEquipe.mockClear();
    storeStub.registrarJogador.mockClear();

    TestBed.configureTestingModule({
      imports: [RegistrarEstatisticasComponent],
      providers: [provideRouter([]), { provide: RegistrarEstatisticasStore, useValue: storeStub }]
    });
  });

  it('calls store.registrarEquipe with the partidaId from the route and the form values', () => {
    const fixture = TestBed.createComponent(RegistrarEstatisticasComponent);
    fixture.componentRef.setInput('id', 'p1');
    fixture.detectChanges();

    const forms = fixture.nativeElement.querySelectorAll('form');
    const equipeForm = forms[0] as HTMLFormElement;
    const inputs = equipeForm.querySelectorAll('input');
    (inputs[0] as HTMLInputElement).value = 'equipe-1';
    (inputs[1] as HTMLInputElement).value = '2';
    (inputs[2] as HTMLInputElement).value = '10';
    (inputs[3] as HTMLInputElement).value = '5';
    (inputs[4] as HTMLInputElement).value = '55.5';
    equipeForm.dispatchEvent(new Event('submit'));

    expect(storeStub.registrarEquipe).toHaveBeenCalledWith({
      partidaId: 'p1',
      equipeId: 'equipe-1',
      gols: 2,
      finalizacoes: 10,
      escanteios: 5,
      posse: 55.5
    });
  });

  it('calls store.registrarJogador with titular reflecting the checkbox', () => {
    const fixture = TestBed.createComponent(RegistrarEstatisticasComponent);
    fixture.componentRef.setInput('id', 'p1');
    fixture.detectChanges();

    const forms = fixture.nativeElement.querySelectorAll('form');
    const jogadorForm = forms[1] as HTMLFormElement;
    const inputs = jogadorForm.querySelectorAll('input');
    (inputs[0] as HTMLInputElement).value = 'jogador-1';
    (inputs[1] as HTMLInputElement).value = '1';
    (inputs[2] as HTMLInputElement).value = '2';
    (inputs[3] as HTMLInputElement).value = '90';
    (inputs[4] as HTMLInputElement).checked = true;
    (inputs[5] as HTMLInputElement).value = '8';
    jogadorForm.dispatchEvent(new Event('submit'));

    expect(storeStub.registrarJogador).toHaveBeenCalledWith({
      partidaId: 'p1',
      jogadorId: 'jogador-1',
      gols: 1,
      assistencias: 2,
      minutos: 90,
      titular: true,
      nota: 8
    });
  });

  it('shows a success message once equipeRegistrada is true', () => {
    storeStub.equipeRegistrada.set(true);

    const fixture = TestBed.createComponent(RegistrarEstatisticasComponent);
    fixture.componentRef.setInput('id', 'p1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Registrada com sucesso');
  });
});
