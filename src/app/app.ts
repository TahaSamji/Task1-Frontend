import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UploadComponent } from "./components/main";
// templateUrl: './app.html',
@Component({
  selector: 'app-root',
  imports: [ UploadComponent],
  template: '   <app-upload />',
  
})
export class App {
  protected title = 'myapp-front';
}
