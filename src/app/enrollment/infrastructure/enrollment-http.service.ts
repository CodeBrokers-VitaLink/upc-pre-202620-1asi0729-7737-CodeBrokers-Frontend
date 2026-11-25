import { RegisteredDoctor } from '../domain/model/registered-doctor.entity';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnrollmentPort } from '../application/enrollment.port';
import { DoctorRegistration, FamilyRegistration } from '../domain/model/registration.entity';
import { ClinicResponse, DoctorOptionResponse } from './catalog/catalog.response';
import { CatalogAssembler } from './catalog/catalog.assembler';
import { RegistrationAssembler } from './registration/registration.assembler';

function registrationFailure(error: HttpErrorResponse) {
  if (error.status === 400 && error.error?.detail === 'El número de colegiatura no es válido.') return throwError(() => new Error('invalidLicense'));
  if (error.status === 400 && error.error?.detail === 'El nombre no coincide con la colegiatura registrada.') return throwError(() => new Error('licenseNameMismatch'));
  return throwError(() => new Error(error.status === 409 ? 'duplicateAccount' : error.status === 400 ? 'invalidForm' : 'unavailable'));
}
@Injectable({ providedIn: 'root' })
export class EnrollmentHttpService implements EnrollmentPort {
  private readonly http = inject(HttpClient);
  lookupLicense(license: string) {
    return this.http.get<RegisteredDoctor>(environment.apiUrl + '/medical-registry/' + encodeURIComponent(license));
  }
  clinics() { return this.http.get<ClinicResponse[]>(`${environment.apiUrl}/clinics`).pipe(map(values => values.map(CatalogAssembler.clinic))); }
  doctors() { return this.http.get<DoctorOptionResponse[]>(`${environment.apiUrl}/doctors`).pipe(map(values => values.map(CatalogAssembler.doctor))); }
  registerDoctor(value: DoctorRegistration) {
    return this.http.post(`${environment.apiUrl}/auth/sign-up`, RegistrationAssembler.doctor(value)).pipe(map(() => undefined), catchError(registrationFailure));
  }
  registerFamily(value: FamilyRegistration) {
    return this.http.post(`${environment.apiUrl}/enrollment/families`, RegistrationAssembler.family(value)).pipe(map(() => undefined), catchError(registrationFailure));
  }
}
