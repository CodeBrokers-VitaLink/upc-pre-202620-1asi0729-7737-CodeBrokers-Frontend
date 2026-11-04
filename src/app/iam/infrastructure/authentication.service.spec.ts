import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthenticationStore } from '../application/authentication.store';
import { AuthenticationService } from './authentication.service';
import { BackendSessionStorage } from './backend-session.storage';
import { authenticationInterceptor } from './authentication.interceptor';
import { environment } from '../../../environments/environment';

describe('Backend authentication', () => {
  let http: HttpTestingController;
  const user = { id: 'DR-02', name: 'Luis Ramos', email: 'luis@vitalink.demo', role: 'doctor', phone: '900000002', hospital: null };
  const expiresAt = () => new Date(Date.now() + 3600000).toISOString();
  const seedSession = () => TestBed.inject(BackendSessionStorage).save('demo-token', expiresAt(), {
    userId: user.id, role: { code: 'doctor' },
  });

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [
      provideRouter([]), provideHttpClient(withInterceptors([authenticationInterceptor])), provideHttpClientTesting(),
    ] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); sessionStorage.clear(); });

  it('posts credentials and stores only the backend token, expiration and session', () => {
    const store = TestBed.inject(AuthenticationStore);
    let home = '';
    store.signIn(' LUIS@VITALINK.DEMO ', 'Demo12345').subscribe(value => home = value);
    const request = http.expectOne(environment.apiUrl + '/auth/sign-in');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: user.email, password: 'Demo12345' });
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ token: 'demo-token', tokenType: 'Bearer', expiresAt: expiresAt(), user });
    expect(home).toBe('/doctor/dashboard');
    expect(store.session()?.userId).toBe('DR-02');
    expect(store.accessToken()).toBe('demo-token');
    expect(sessionStorage.getItem('vitalink-backend-session')).not.toContain('Demo12345');
  });

  it('adds the bearer token only to the configured backend', () => {
    seedSession();
    const client = TestBed.inject(HttpClient);
    client.get(environment.apiUrl + '/patients').subscribe();
    const backend = http.expectOne(environment.apiUrl + '/patients');
    expect(backend.request.headers.get('Authorization')).toBe('Bearer demo-token');
    backend.flush([]);
    const externalUrl = environment.apiUrl + '-external/data';
    client.get(externalUrl).subscribe();
    const external = http.expectOne(externalUrl);
    expect(external.request.headers.has('Authorization')).toBe(false);
    external.flush({});
    client.get('./i18n/es.json').subscribe();
    const translations = http.expectOne('./i18n/es.json');
    expect(translations.request.headers.has('Authorization')).toBe(false);
    translations.flush({});
  });

  it('expires the local session and redirects when the backend rejects the token', () => {
    seedSession();
    const store = TestBed.inject(AuthenticationStore);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    TestBed.inject(HttpClient).get(environment.apiUrl + '/patients').subscribe({ error: () => {} });
    http.expectOne(environment.apiUrl + '/patients').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(store.session()).toBeNull();
    expect(store.accessToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('shows invalid credentials without treating login failure as an expired request', () => {
    const store = TestBed.inject(AuthenticationStore);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    store.signIn(user.email, 'wrong').subscribe({ error: () => {} });
    http.expectOne(environment.apiUrl + '/auth/sign-in').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(store.error()).toBe('invalidCredentials');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('revokes the current backend token and immediately clears local data on logout', () => {
    seedSession();
    const store = TestBed.inject(AuthenticationStore);
    store.signOut();
    const request = http.expectOne(environment.apiUrl + '/auth/sign-out');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer demo-token');
    expect(store.session()).toBeNull();
    expect(store.accessToken()).toBeNull();
    request.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('does not restore expired tokens or old fake API sessions', () => {
    sessionStorage.setItem('vitalink-backend-session', JSON.stringify({ token: 'old', expiresAt: '2000-01-01T00:00:00Z', session: { userId: 'DR-01', role: { code: 'doctor' } } }));
    sessionStorage.setItem('vitalink-login-session', JSON.stringify({ userId: 'DR-01', role: { code: 'doctor' } }));
    expect(TestBed.inject(AuthenticationService).restore()).toBeNull();
    expect(sessionStorage.getItem('vitalink-backend-session')).toBeNull();
    expect(sessionStorage.getItem('vitalink-login-session')).toBeNull();
  });

  it('does not expire a new session because a previous account receives a delayed 401', () => {
    seedSession();
    const store = TestBed.inject(AuthenticationStore);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    TestBed.inject(HttpClient).get(environment.apiUrl + '/patients').subscribe({ error: () => {} });
    const old = http.expectOne(environment.apiUrl + '/patients');
    TestBed.inject(BackendSessionStorage).save('new-token', expiresAt(), { userId: 'DR-02', role: { code: 'doctor' } });
    old.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(store.accessToken()).toBe('new-token');
    expect(navigate).not.toHaveBeenCalled();
  });
});
