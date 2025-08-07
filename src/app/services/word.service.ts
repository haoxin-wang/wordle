import { Injectable,Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject,Observable, map, catchError, of } from 'rxjs';

export interface WordObject {
  word: string;
  definition: string;
}

export interface WordleConstraints {
  knownLetters?: string;
  unknownLetters?: string;
  excludedLetters?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WordService {
  private wordObjects: WordObject[] = [];
  private isLoaded = new BehaviorSubject<boolean>(false);
  private readonly wordLength = 5;

private http!: HttpClient;

  constructor(private injector: Injector) {
    // Use setTimeout to ensure injector is ready
    setTimeout(() => {
      this.http = this.injector.get(HttpClient);
      this.loadDictionary().subscribe();
    });
  }
  loadDictionary(): Observable<void> {
    if (!this.http) {
      console.error('HttpClient not available');
      return of(undefined);
    }
    return this.http.get<WordObject[]>('assets/word_objects.json').pipe(
      map(words => {
        this.wordObjects = this.validateWordObjects(words);
        this.isLoaded.next(true);
        return;
      }),
      catchError(error => {
        console.error('Failed to load dictionary:', error);
        // Initialize with fallback words if needed
        this.wordObjects = this.getFallbackWords();
        this.isLoaded.next(true);
        return of(undefined);
      })
    );
  }

  private validateWordObjects(words: any[]): WordObject[] {
  return words.filter((item, index) => {
    if (!item) {
      console.warn(`Entry at index ${index} is null/undefined:`, item);
      return false;
    }
    if (!item.word || typeof item.word !== 'string') {
      console.warn(`Entry at index ${index} has invalid 'word' property:`, item);
      return false;
    }
    if (item.word.length !== this.wordLength) {
      console.warn(`Word '${item.word}' at index ${index} has wrong length (expected ${this.wordLength}, got ${item.word.length})`);
      return false;
    }
    return true;
  });
}

  getSuggestions(constraints: WordleConstraints): WordObject[] {
    if (!this.isLoaded.value) {
      console.warn('Word list not loaded yet - using fallback');
      return this.getFallbackWords().filter(wordObj => 
        this.matchesConstraints(wordObj.word, constraints)
      );
    }
    
    return this.wordObjects.filter(obj => 
      this.matchesConstraints(obj.word, constraints)
    );
  }

  private matchesConstraints(word: string, constraints: WordleConstraints): boolean {
    const wordLower = word.toLowerCase();
    
    // Check word length
    if (wordLower.length !== this.wordLength) {
      return false;
    }

    // Check excluded letters
    if (constraints.excludedLetters) {
      const excluded = constraints.excludedLetters.toLowerCase().split('');
      if (excluded.some(letter => wordLower.includes(letter))) {
        return false;
      }
    }

    // Check unknown letters (must contain)
    if (constraints.unknownLetters) {
      const required = constraints.unknownLetters.toLowerCase().split('');
      if (!required.every(letter => wordLower.includes(letter))) {
        return false;
      }
    }

    // Check known positions
    if (constraints.knownLetters) {
      const knownPairs = constraints.knownLetters.toLowerCase().match(/.{2}/g) || [];
      for (const pair of knownPairs) {
        const letter = pair[0];
        const position = parseInt(pair[1]) - 1;
        
        // Validate position is within word length
        if (position >= 0 && position < this.wordLength) {
          if (wordLower[position] !== letter) {
            return false;
          }
        }
      }
    }

    return true;
  }
  
  private getFallbackWords(): WordObject[] {
    return [
      { word: 'apple', definition: 'A round fruit with crisp flesh' },
      { word: 'brave', definition: 'Ready to face danger or pain' },
      { word: 'crane', definition: 'A large tall machine for lifting heavy objects' },
      { word: 'dance', definition: 'Move rhythmically to music' },
      { word: 'eagle', definition: 'A large bird of prey' },
      { word: 'fable', definition: 'A short story conveying a moral' },
      { word: 'grape', definition: 'A small sweet fruit used to make wine' },
      { word: 'hazel', definition: 'A light brown or greenish-brown color' },
      { word: 'ivory', definition: 'A hard white material from elephant tusks' },
      { word: 'jolly', definition: 'Happy and cheerful' }
    ];
  }
}