import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Session } from '../domain/model/session.entity';
import { SessionAssembler } from './session.assembler';
import { SessionResponse } from './session.response';
import { UserResponse } from './user.response';
import { UserAssembler } from './user.assembler';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly http = inject(HttpClient);
  private readonly key = 'vitalink-login-session';
  restore(): Session | null {
    try {
      const raw = sessionStorage.getItem(this.key);
      if (!raw) return null;
      const value: unknown = JSON.parse(raw);
      if (!this.isSession(value)) { this.signOut(); return null; }
      return SessionAssembler.toEntity(value);
    } catch { this.signOut(); return null; }
  }
  signIn(email: string, password: string) {
    return this.http.get<UserResponse[]>(environment.apiUrl + '/users', {params: {email: email.trim().toLowerCase()}}).pipe(map(users => {
      const response = users.find(user => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password && (user.role === 'doctor' || user.role === 'family'));
      if (!response) throw new Error('invalidCredentials');
      const user = UserAssembler.toEntity(response);
      const session = new Session(user.id, user.role);
      sessionStorage.setItem(this.key, JSON.stringify(SessionAssembler.toResponse(session)));
      return session;
    }));
  }
  signOut(): void { sessionStorage.removeItem(this.key); }
  private isSession(value: unknown): value is SessionResponse {
    if (!value || typeof value !== 'object') return false;
    const session = value as Partial<SessionResponse>;
    return typeof session.userId === 'string' && !!session.userId &&
      (session.role?.code === 'doctor' || session.role?.code === 'family');
  }
}
