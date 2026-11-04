import { Injectable } from '@angular/core';
import type { SessionResponse } from './session.response';

interface StoredBackendSession {
  token: string;
  expiresAt: string;
  session: SessionResponse;
}

@Injectable({ providedIn: 'root' })
export class BackendSessionStorage {
  private readonly key = 'vitalink-backend-session';

  read(): StoredBackendSession | null {
    try {
      // Fake API sessions do not authenticate against the backend.
      sessionStorage.removeItem('vitalink-login-session');
      const value: unknown = JSON.parse(sessionStorage.getItem(this.key) ?? 'null');
      if (!this.valid(value)) { this.clear(); return null; }
      return value;
    } catch { this.clear(); return null; }
  }

  save(token: string, expiresAt: string, session: SessionResponse): void {
    const value = { token, expiresAt, session };
    if (!this.valid(value)) throw new Error('invalidSession');
    sessionStorage.setItem(this.key, JSON.stringify(value));
  }

  clear(): void {
    sessionStorage.removeItem(this.key);
    sessionStorage.removeItem('vitalink-login-session');
  }

  private valid(value: unknown): value is StoredBackendSession {
    if (!value || typeof value !== 'object') return false;
    const data = value as Partial<StoredBackendSession>;
    return typeof data.token === 'string' && !!data.token &&
      typeof data.expiresAt === 'string' && Date.parse(data.expiresAt) > Date.now() &&
      typeof data.session?.userId === 'string' && !!data.session.userId &&
      ['doctor', 'family', 'patient'].includes(data.session.role?.code ?? '');
  }
}
