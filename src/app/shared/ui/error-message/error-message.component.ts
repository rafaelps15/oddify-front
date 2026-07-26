import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  template: `<p class="error-message">{{ message() }}</p>`
})
export class ErrorMessageComponent {
  message = input.required<string>();
}
