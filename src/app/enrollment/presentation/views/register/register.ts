import { vitalLimits, vitalStatus, VitalField } from '../../../domain/model/vital-guidance';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EnrollmentStore } from '../../../application/enrollment.store';
import { AccountDetails, DoctorRegistration, PatientEnrollment, validAccount } from '../../../domain/model/registration.entity';

@Component({
  imports: [FormsModule, RouterLink, TranslatePipe, MatButtonModule],
  providers: [EnrollmentStore],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  readonly store = inject(EnrollmentStore);
  private readonly destroy = inject(DestroyRef);
  mode: 'doctor' | 'family' = 'family';
  step = 0;
  submitted = false;
  confirmPassword = '';
  account: AccountDetails = { name: '', email: '', password: '', phone: '' };
  doctor: DoctorRegistration = { account: this.account, specialty: '', professionalLicense: '', worksInClinic: false, clinicId: null };
  patient: PatientEnrollment = {
    givenName: '', familyName: '', age: null, location: '', familyDisplayName: '',
    serviceType: 'independent', clinicId: null, doctorId: null, consent: false,
    initialVitals: { heartRate: null, oxygen: null, glucose: null, systolic: null, diastolic: null },
  };
  readonly vitalLimits = vitalLimits;
  vitalState(field: VitalField) { return vitalStatus(field, this.patient.initialVitals, this.patient.age); }
  constructor() { this.store.loadCatalog(); }
  get availableDoctors() {
    return this.store.doctors().filter(d => d.practiceType === this.patient.serviceType &&
      (this.patient.serviceType !== 'clinic' || d.clinicId === this.patient.clinicId));
  }
  changeMode(mode: 'doctor' | 'family'): void { this.mode = mode; this.step = 0; this.submitted = false; this.store.error.set(''); }
  setEmployment(value: boolean): void { this.doctor.worksInClinic = value; this.doctor.clinicId = null; }
  changeService(value: 'clinic' | 'independent'): void { this.patient.serviceType = value; this.patient.clinicId = null; this.patient.doctorId = null; this.patient.consent = false; }
  changeClinic(value: string | null): void { this.patient.clinicId = value; this.patient.doctorId = null; this.patient.consent = false; }
  back(): void { this.step = 0; this.submitted = false; this.store.error.set(''); }
  submit(form: NgForm): void {
    this.submitted = true;
    if (this.store.saving() || form.invalid) return;
    if (this.mode === 'doctor' || this.step === 0) {
      if (!validAccount(this.account) || this.confirmPassword !== this.account.password) {
        this.store.error.set('invalidForm'); return;
      }
    }
    if (this.mode === 'family' && this.step === 0) { this.step = 1; this.submitted = false; return; }
    const operation = this.mode === 'doctor' ? this.store.registerDoctor(this.doctor) : this.store.registerFamily({ account: this.account, patient: this.patient });
    operation.pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => { this.account.password = ''; this.confirmPassword = ''; },
      error: () => {},
    });
  }
}
