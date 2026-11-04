import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authenticationInterceptor } from './iam/infrastructure/authentication.interceptor';
import { ENROLLMENT_PORT } from './enrollment/application/enrollment.port';
import { EnrollmentHttpService } from './enrollment/infrastructure/enrollment-http.service';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ENROLLMENT_PORT, useExisting: EnrollmentHttpService },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withInterceptors([authenticationInterceptor])),
    provideTranslateService({
      lang: localStorage.getItem('vitalink-language') === 'en' ? 'en' : 'es',
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json', failOnError: true }),
    }),


  ],
};
