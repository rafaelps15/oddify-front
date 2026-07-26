import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-input',
  template: `
    <label class="search-input">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input type="search" [placeholder]="placeholder()" (input)="valorAlterado.emit($any($event.target).value)" />
    </label>
  `,
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent {
  placeholder = input('Buscar…');
  valorAlterado = output<string>();
}
