import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `<p class="empty-state">{{ message() }}</p>`
})
export class EmptyStateComponent {
  message = input('Nenhum item encontrado.');
}
