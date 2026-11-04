import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { EnrollmentHttpService } from './enrollment-http.service';
import { authenticationInterceptor } from '../../iam/infrastructure/authentication.interceptor';
import { BackendSessionStorage } from '../../iam/infrastructure/backend-session.storage';
import { environment } from '../../../environments/environment';

describe('Enrollment backend adapter', () => {
  let http: HttpTestingController;
  const account = { name: ' Familiar ', email: ' FAMILY@example.com ', password: 'Demo12345', phone: '900000111' };
  beforeEach(() => {
    sessionStorage.clear(); TestBed.configureTestingModule({ providers: [provideRouter([]),
      provideHttpClient(withInterceptors([authenticationInterceptor])), provideHttpClientTesting(),
    ] }); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); sessionStorage.clear(); });
  it('registers the complete family and patient without reusing a logged-in account token', () => {
    TestBed.inject(BackendSessionStorage).save('existing-token', new Date(Date.now() + 60000).toISOString(), { userId: 'DR-01', role: { code: 'doctor' } });
    TestBed.inject(EnrollmentHttpService).registerFamily({ account, patient: {
      givenName: ' Carmen ', familyName: 'Morales', age: 72, location: 'Lima', familyDisplayName: '',
      serviceType: 'independent', clinicId: 'old-clinic', doctorId: 'DR-02', consent: true,
      initialVitals: { heartRate: 75, oxygen: 97, glucose: 110, systolic: 120, diastolic: 80 },
    } }).subscribe();
    const request = http.expectOne(environment.apiUrl + '/enrollment/families');
    expect(request.request.method).toBe('POST'); expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.body.email).toBe('family@example.com'); expect(request.request.body.patient.clinicId).toBeNull();
    expect(request.request.body.patient.initialVitals.diastolic).toBe(80); expect(request.request.body.patient.givenName).toBe('Carmen');
    expect(request.request.body).not.toHaveProperty('role'); request.flush({ userId: 'FC-new', patientId: 'P-new' });
  });
  it('uses the same doctor endpoint for independent and clinic employment', () => {
    const service = TestBed.inject(EnrollmentHttpService);
    for (const worksInClinic of [false, true]) {
      service.registerDoctor({ account, specialty: 'General', professionalLicense: '12345', worksInClinic, clinicId: 'CL-01' }).subscribe();
      const request = http.expectOne(environment.apiUrl + '/auth/sign-up');
      expect(request.request.body.practiceType).toBe(worksInClinic ? 'clinic' : 'independent');
      expect(request.request.body.clinicId).toBe(worksInClinic ? 'CL-01' : null); expect(request.request.body.role).toBe('doctor'); request.flush({});
    }
  });
  it('maps an account conflict to an application error without exposing database details', () => {
    let message = '';
    TestBed.inject(EnrollmentHttpService).registerDoctor({ account, specialty: 'General', professionalLicense: '12345', worksInClinic: false, clinicId: null })
      .subscribe({ error: (error: Error) => message = error.message });
    http.expectOne(environment.apiUrl + '/auth/sign-up').flush({ detail: 'Database details' }, { status: 409, statusText: 'Conflict' });
    expect(message).toBe('duplicateAccount');
  });
});
