import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { CARE_CONTEXT } from './care/infrastructure/care/care-context';
import { environment } from '../environments/environment';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(),
    provideTranslateService({
      lang: localStorage.getItem('vitalink-language') === 'en' ? 'en' : 'es',
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json', failOnError: true }),
    }),


    {
      provide: CARE_CONTEXT,
      useValue: { providerId: environment.providerId, familyId: environment.familyId },
    },
  ],
};
