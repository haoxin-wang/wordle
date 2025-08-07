import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordleSolverComponent } from './components/wordle-solver/wordle-solver.component';

@Component({
  
  standalone: true,
  imports: [CommonModule, WordleSolverComponent],
  selector: 'app-root',
  //template: `<app-wordle-solver></app-wordle-solver>`,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      padding: 2rem;
    }
  `],
  templateUrl: './app.component.html',  // Not app.html
  styleUrls: ['./app.component.scss']   // Not app.scss
})
export class AppComponent {}