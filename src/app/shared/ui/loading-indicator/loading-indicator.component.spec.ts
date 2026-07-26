import { TestBed } from '@angular/core/testing';
import { LoadingIndicatorComponent } from './loading-indicator.component';

describe('LoadingIndicatorComponent', () => {
  it('renders a loading message', () => {
    TestBed.configureTestingModule({ imports: [LoadingIndicatorComponent] });
    const fixture = TestBed.createComponent(LoadingIndicatorComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Carregando');
  });
});
