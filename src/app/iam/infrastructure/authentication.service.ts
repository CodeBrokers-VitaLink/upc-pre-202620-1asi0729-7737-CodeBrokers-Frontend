import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, of } from 'rxjs';
import { Session } from '../domain/model/session.entity';
import { SessionAssembler } from './session.assembler';
import { UserAssembler } from './user.assembler';
import { AuthenticationResponse } from './authentication.response';
import { BackendSessionStorage } from './backend-session.storage';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(BackendSessionStorage);
  restore(): Session | null {
    const stored = this.storage.read();
    return stored ? SessionAssembler.toEntity(stored.session) : null;
  }
  accessToken(): string | null { return this.storage.read()?.token ?? null; }
  clearLocalSession(): void { this.storage.clear(); }
  signIn(email: string, password: string) {
    return this.http.post<AuthenticationResponse>(environment.apiUrl + '/auth/sign-in', {
      email: email.trim().toLowerCase(), password,
    }).pipe(map(response => {
      const user = UserAssembler.toEntity(response.user);
      const session = new Session(user.id, user.role);
      this.storage.save(response.token, response.expiresAt, SessionAssembler.toResponse(session));
      return session;
    }));
  }
  signOut() {
    return this.accessToken()
      ? this.http.post<void>(environment.apiUrl + '/auth/sign-out', {})
      : of(undefined);
  }
}
