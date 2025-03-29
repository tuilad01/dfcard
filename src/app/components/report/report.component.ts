import { Component, input } from '@angular/core';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent {
  name = input.required<string>();
  color = input.required<'blue' | 'yellow' | 'red' | 'gray'>();
  then = input.required<number>();
  now = input.required<number>();

  get percent() {
    const value = (this.now() / this.then()) * 100 - 100;
    return value;
  }

  getBorderBottomColor() {
    return this.color() == 'red'
      ? 'border-b-red-300'
      : this.color() == 'yellow'
        ? 'border-b-yellow-300'
        : this.color() == 'gray'
          ? 'border-b-gray-500'
          : 'border-b-blue-300';
  }
}
