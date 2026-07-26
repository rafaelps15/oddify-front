import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  it('renders the default message when none is given', () => {
    TestBed.configureTestingModule({ imports: [EmptyStateComponent] });
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhum item encontrado.');
  });

  it('renders a custom message when given', () => {
    TestBed.configureTestingModule({ imports: [EmptyStateComponent] });
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'Nenhuma liga cadastrada.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhuma liga cadastrada.');
  });
});
