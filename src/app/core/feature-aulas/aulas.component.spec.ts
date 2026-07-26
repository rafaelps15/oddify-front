import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AulasComponent } from './aulas.component';

describe('AulasComponent', () => {
  it('renders the walkthrough sections', () => {
    TestBed.configureTestingModule({ imports: [AulasComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AulasComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Fixtures');
    expect(text).toContain('Análise');
    expect(text).toContain('Apostas');
  });
});
