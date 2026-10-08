import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, map, throwError } from 'rxjs';
import { AuthenticationService } from '../infrastructure/authentication.service';
@Injectable({ providedIn: 'root' })
export class AuthenticationStore {
  private readonly service = inject(AuthenticationService);
  readonly session = signal(this.service.restore());
  readonly hasSession = computed(() => this.session() !== null);
  readonly role = computed(() => this.session()?.role.code ?? null);
  readonly signingIn = signal(false);
  readonly error = signal('');
  signIn(email: string, password: string) {
    this.signingIn.set(true); this.error.set('');
    return this.service.signIn(email, password).pipe(
      map(session => { this.session.set(session); return session.role.home; }),
      catchError(error => { this.error.set(error.message === 'invalidCredentials' ? 'invalidCredentials' : 'loginUnavailable'); return throwError(() => error); }),
      finalize(() => this.signingIn.set(false)),
    );
  }
  signOut(): void { this.service.signOut(); this.session.set(null); this.error.set(''); }
}
