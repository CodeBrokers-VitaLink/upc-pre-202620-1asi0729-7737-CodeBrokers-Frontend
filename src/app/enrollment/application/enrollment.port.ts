import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Clinic } from '../domain/model/clinic.entity';
import { DoctorOption } from '../domain/model/doctor-option.entity';
import { DoctorRegistration, FamilyRegistration } from '../domain/model/registration.entity';
export interface EnrollmentPort {
  clinics(): Observable<Clinic[]>;
  doctors(): Observable<DoctorOption[]>;
  registerDoctor(value: DoctorRegistration): Observable<void>;
  registerFamily(value: FamilyRegistration): Observable<void>;
}
export const ENROLLMENT_PORT = new InjectionToken<EnrollmentPort>('ENROLLMENT_PORT');
