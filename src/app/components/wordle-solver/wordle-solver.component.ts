import { Component, OnInit,ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule,FormBuilder, FormGroup,Validators } from '@angular/forms';
import { WordService,WordObject} from '../../services/word.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  selector: 'app-wordle-solver',
  templateUrl: './wordle-solver.component.html',
  styleUrls: ['./wordle-solver.component.scss']
})
export class WordleSolverComponent implements OnInit {
  solverForm: FormGroup;
  suggestions: WordObject[] = [];
  isLoading = false;
  showDefinitions = true; // Toggle for definitions

  constructor(
    private fb: FormBuilder,
    private wordService: WordService,
    private cdr: ChangeDetectorRef
  ) {
    this.solverForm = this.fb.group({
      knownLetters: [''],
      unknownLetters: [''],
      excludedLetters: ['']
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.wordService.loadDictionary().subscribe();
    });
  }

  onSubmit(): void {
    if (this.solverForm.valid) {
      this.isLoading = true;
      this.suggestions = [];
      
  
      try {
        this.suggestions = this.wordService.getSuggestions(this.solverForm.value);
      } catch (error) {
        console.error('Error getting suggestions:', error);
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();  
      }
    }
  }

  toggleDefinitions(): void {
    this.showDefinitions = !this.showDefinitions;
  }
}