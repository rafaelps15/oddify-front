import { TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  it('renders the given message', () => {
    TestBed.configureTestingModule({ imports: [ErrorMessageComponent] });
    const fixture = TestBed.createComponent(ErrorMessageComponent);
    fixture.componentRef.setInput('message', 'Falha ao carregar');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Falha ao carregar');
  });
});
