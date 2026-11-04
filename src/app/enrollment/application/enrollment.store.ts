import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, tap, throwError } from 'rxjs';
import { ENROLLMENT_PORT, EnrollmentPort } from './enrollment.port';
import { Clinic } from '../domain/model/clinic.entity';
import { DoctorOption } from '../domain/model/doctor-option.entity';
import { DoctorRegistration, FamilyRegistration, validDoctor, validFamily } from '../domain/model/registration.entity';

@Injectable()
export class EnrollmentStore {
  private readonly port = inject(ENROLLMENT_PORT);
  readonly clinics = signal<Clinic[]>([]);
  readonly doctors = signal<DoctorOption[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  loadCatalog(): void {
    this.loading.set(true); this.error.set('');
    forkJoin({ clinics: this.port.clinics(), doctors: this.port.doctors() }).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: values => { this.clinics.set(values.clinics); this.doctors.set(values.doctors); },
      error: () => this.error.set('catalogUnavailable'),
    });
  }
  registerDoctor(value: DoctorRegistration) {
    if (!validDoctor(value)) return this.invalid();
    return this.save(this.port.registerDoctor(value));
  }
  registerFamily(value: FamilyRegistration) {
    if (!validFamily(value)) return this.invalid();
    return this.save(this.port.registerFamily(value));
  }
  private invalid() { this.error.set('invalidForm'); return throwError(() => new Error('invalidForm')); }
  private save(operation: ReturnType<EnrollmentPort['registerDoctor']>) {
    this.saving.set(true); this.error.set('');
    return operation.pipe(
      tap(() => this.success.set(true)),
      catchError((error: Error) => {
        this.error.set(['duplicateAccount', 'invalidForm'].includes(error.message) ? error.message : 'unavailable');
        return throwError(() => error);
      }),
      finalize(() => this.saving.set(false)),
    );
  }
}
