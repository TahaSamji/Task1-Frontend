import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// templateUrl: './app.html',
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<button>',
  styleUrl: './app.css'
})
export class App {
  protected title = 'myapp-front';
}
