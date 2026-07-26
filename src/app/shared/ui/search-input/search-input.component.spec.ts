import { TestBed } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';

describe('SearchInputComponent', () => {
  it('emits the typed value', () => {
    TestBed.configureTestingModule({ imports: [SearchInputComponent] });
    const fixture = TestBed.createComponent(SearchInputComponent);
    fixture.detectChanges();

    let valorEmitido: string | undefined;
    fixture.componentInstance.valorAlterado.subscribe((valor) => (valorEmitido = valor));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'premier';
    input.dispatchEvent(new Event('input'));

    expect(valorEmitido).toBe('premier');
  });

  it('renders the given placeholder', () => {
    TestBed.configureTestingModule({ imports: [SearchInputComponent] });
    const fixture = TestBed.createComponent(SearchInputComponent);
    fixture.componentRef.setInput('placeholder', 'Buscar liga…');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input').placeholder).toBe('Buscar liga…');
  });
});
