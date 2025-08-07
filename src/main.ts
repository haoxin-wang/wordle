import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // Import config
import { provideHttpClient } from '@angular/common/http'; // Correct import
import { importProvidersFrom } from '@angular/core';
import 'zone.js';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));