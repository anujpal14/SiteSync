// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { jwtInterceptor } from '@core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    // provideHttpClient(withInterceptors([apiInterceptor]), withFetch()),
    provideHttpClient(withInterceptors([jwtInterceptor, apiInterceptor]), withFetch()),
    provideAnimationsAsync(),
  ]
};
