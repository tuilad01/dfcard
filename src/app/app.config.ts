import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    // for side bar primeng
    importProvidersFrom([BrowserAnimationsModule]),
    provideServiceWorker('ngsw-worker.js', {
      enabled: isDevMode(),
      registrationStrategy: 'registerImmediately',
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately',
    }),
  ],
};
