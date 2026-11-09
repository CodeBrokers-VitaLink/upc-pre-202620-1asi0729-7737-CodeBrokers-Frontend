import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of, tap, throwError, timeout } from 'rxjs';
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
  readonly clinicsLoading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  loadCatalog(): void {
    if (this.loading()) return;
    this.loading.set(true); this.clinicsLoading.set(true); this.error.set('');
    forkJoin({
      clinics: this.port.clinics().pipe(
        timeout(90000),
        tap(values => { this.clinics.set(values); this.clinicsLoading.set(false); }),
        catchError(() => { this.error.set('catalogUnavailable'); return of(null); }),
        finalize(() => this.clinicsLoading.set(false)),
      ),
      doctors: this.port.doctors().pipe(
        timeout(90000),
        tap(values => this.doctors.set(values)),
        catchError(() => { this.error.set('catalogUnavailable'); return of(null); }),
      ),
    }).pipe(finalize(() => this.loading.set(false))).subscribe();
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
