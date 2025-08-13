import { Component, OnInit,ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule,FormBuilder, FormGroup,Validators,AbstractControl, ValidationErrors   } from '@angular/forms';
import { WordService,WordObject} from '../../services/word.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  selector: 'app-wordle-solver',
  templateUrl: './wordle-solver.component.html',
  styleUrls: ['./wordle-solver.component.scss']
})
export class WordleSolverComponent implements OnInit {
  containsLettersError = '';
  showProblemStatement  = false;
  solverForm: FormGroup;
  suggestions: WordObject[] = [];
  isLoading = false;
  showDefinitions = true; // Toggle for definitions
  showEmptyFormError = false;

  constructor(
    private fb: FormBuilder,
    private wordService: WordService,
    private cdr: ChangeDetectorRef
  ) {
    this.solverForm = this.fb.group({
      knownLetters: [''],
      unknownLetters: ['',[this.validateContainsLetters.bind(this)]],
      excludedLetters: ['']
    });
  }
  // Custom validator for Contains Letters field
  private validateContainsLetters(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  // Regex to match patterns like "a", "ab", "e34", "a1b23"
  if (!/^([a-z](\d*))+$/i.test(value)) {
    return { invalidFormat: true };
  }

  const letterGroups = value.toLowerCase().match(/([a-z])(\d*)/g) || [];
  
  for (const group of letterGroups) {
    const digits = group.slice(1).split('');
    
    for (const digit of digits) {
      const positionNum = parseInt(digit, 10);
      if (positionNum < 1 || positionNum > 5) {
        return { 
          invalidPosition: {
            actual: positionNum,
            allowed: "1-5"
          }
        };
      }
    }
  }
  
  return null;
}
  ngOnInit(): void {
    setTimeout(() => {
      this.wordService.loadDictionary().subscribe();
    });
  }

  onSubmit(): void {
    this.containsLettersError = '';
    const formValues = this.solverForm.value;
     this.showEmptyFormError = !formValues.knownLetters && 
                          !formValues.unknownLetters && 
                          !formValues.excludedLetters;

    if (this.showEmptyFormError) {
      return;
    }
     if (this.solverForm.get('unknownLetters')?.errors) {
    const errors = this.solverForm.get('unknownLetters')?.errors;
    
    if (errors?.['invalidFormat']) {
      this.containsLettersError = 'Format: letter followed by excluded positions (e.g. "e34" means e not in position 3 or 4)';
    }
    else if (errors?.['invalidPosition']) {
      this.containsLettersError = 
        `Position ${errors['invalidPosition'].actual} is invalid. ` +
        `Only single-digit positions (1-5) are allowed`;
    }
  }
    
    // Rest of your existing validation and submission logic
    if (this.containsLettersError) return;
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

  toggleProblemStatement(): void {
    this.showProblemStatement = !this.showProblemStatement;
  }

  toggleDefinitions(): void {
    this.showDefinitions = !this.showDefinitions;
  }
}