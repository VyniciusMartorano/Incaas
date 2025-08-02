import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
// import Lara from '@primeuix/themes/lara';
import Lara from '@primeuix/themes/lara';
import { routes } from './app.routes';
import { authHeaderInterceptor } from './interceptors/auth-header.interceptor';
import { loaderInterceptor } from './interceptors/loader.interceptor';
import { exceptionInterceptor } from './interceptors/exception.interceptor';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authHeaderInterceptor, loaderInterceptor, exceptionInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Lara
      }
    }),
    MessageService
  ]
};
