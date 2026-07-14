import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
})
export class ButtonComponent {

  variant = input<'primary' | 'secondary'>('primary');

  type = input<'button' | 'submit' | 'reset'>('button');

  disabled = input(false);

}