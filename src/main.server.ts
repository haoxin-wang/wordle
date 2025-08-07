import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// export const bootstrap = () => bootstrapApplication(AppComponent, {
//   providers: []
// });

export default function() {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideServerRendering()
    ]
  });
}