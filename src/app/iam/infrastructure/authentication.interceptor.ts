import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthenticationStore } from '../application/authentication.store';
import { environment } from '../../../environments/environment';

export const authenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = environment.apiUrl.replace(/\/$/, '');
  if (!request.url.startsWith(apiUrl + '/')) return next(request);

  const path = request.url.slice(apiUrl.length).split('?')[0];
  const publicRequest = (request.method === 'POST' && ['/auth/sign-in', '/auth/sign-up', '/enrollment/families'].includes(path)) ||
    (request.method === 'GET' && ['/clinics', '/doctors'].includes(path));
  if (publicRequest) return next(request);

  const authentication = inject(AuthenticationStore);
  const router = inject(Router);
  const token = authentication.accessToken();
  const expire = () => {
    authentication.expire();
    void router.navigateByUrl('/');
  };
  if (!token) {
    expire();
    return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Session expired', url: request.url }));
  }
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: HttpErrorResponse) => {
      // A delayed response from an old account must not expire a newer login.
      if (error.status === 401 && authentication.accessToken() === token) expire();
      return throwError(() => error);
    }),
  );
};
