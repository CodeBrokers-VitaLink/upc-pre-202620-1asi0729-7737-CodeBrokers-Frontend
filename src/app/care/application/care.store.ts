import { AuthenticationStore } from '../../iam/application/authentication.store';
import { UserStore } from '../../iam/application/user.store';
import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs';
import { CareService } from '../infrastructure/care/care.service';
import { CareSnapshot } from '../domain/model/care.snapshot';
import { CareAlert, AlertStatus } from '../domain/model/alert.entity';
import { Patient } from '../domain/model/patient.entity';
@Injectable({ providedIn: 'root' })
export class CareStore {
  private readonly service = inject(CareService);
  private readonly authentication = inject(AuthenticationStore);
  private readonly doctorProfile = inject(UserStore);
  private readonly destroy = inject(DestroyRef);
  readonly data = signal<CareSnapshot>({
    patients: [],
    alerts: [],
    records: [],
    interventions: [],
    caregivers: [],
    measurementRanges: [],
  });
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  readonly lastSync = signal<string | null>(null);
  readonly currentCaregiver = computed(() => this.data().caregivers.find(c => c.id === this.authentication.session()?.userId));
  readonly professionalPatients = computed(() =>
    this.data().patients.filter((p) => p.providerId === this.authentication.session()?.userId),
  );
  readonly familyPatients = computed(() =>
    this.data().patients.filter((p) => this.authentication.role() === 'patient' ? p.userId === this.authentication.session()?.userId : p.familyIds.includes(this.authentication.session()?.userId ?? '')),
  );
  readonly professionalAlerts = computed(() =>
    this.data().alerts.filter((a) => this.professionalPatients().some((p) => p.id === a.patientId)),
  );
  readonly pendingPatients = computed(
    () =>
      new Set(
        this.professionalAlerts()
          .filter((a) => a.status === 'PENDING')
          .map((a) => a.patientId),
      ).size,
  );
  private loadedUserId: string | null = null;
  private loadGeneration = 0;
  load() {
    const userId = this.authentication.session()?.userId;
    if (!userId) return;
    if (this.loadedUserId !== userId) {
      this.loadedUserId = userId;
      this.data.set({ patients: [], alerts: [], records: [], interventions: [], caregivers: [], measurementRanges: [] });
      this.loading.set(false); this.saving.set(false); this.message.set(''); this.lastSync.set(null);
    }
    if (this.loading() || this.saving()) return;
    const generation = ++this.loadGeneration;
    this.loading.set(true);
    this.error.set('');
    this.service
      .load()
      .pipe(
        takeUntilDestroyed(this.destroy),
        finalize(() => { if (generation === this.loadGeneration) this.loading.set(false); }),
      )
      .subscribe({
        next: (data) => {
          if (this.authentication.session()?.userId !== userId || generation !== this.loadGeneration) return;
          this.applySnapshot(data);
          this.lastSync.set(new Date().toISOString());
        },
        error: () => { if (this.authentication.session()?.userId === userId && generation === this.loadGeneration) this.error.set('loadError'); },
      });
  }
  recordsFor(id: string) {
    return this.data()
      .records.filter((r) => r.patientId === id)
      .sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt));
  }
  alertsFor(id: string) {
    return this.data()
      .alerts.filter((a) => a.patientId === id)
      .sort((a, b) => b.priority - a.priority);
  }
  interventionsFor(id: string) {
    return this.data()
      .interventions.filter((i) => i.alertId === id)
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  }
  changeStatus(alert: CareAlert, to: AlertStatus, note: string) {
    if (this.saving()) return;
    const session = this.authentication.session();
    const doctor = this.doctorProfile.user();
    const patient = this.data().patients.find(patient => patient.id === alert.patientId);
    if (!session || session.role.code !== 'doctor' || !doctor || doctor.role.code !== 'doctor' || doctor.id !== session.userId || patient?.providerId !== doctor.id) {
      this.error.set('assignedDoctorRequired');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.message.set('');
    // The backend validates the version and writes the intervention atomically.
    this.service.updateAlert(alert.id, to, note.trim(), alert.version).pipe(
      switchMap(() => this.service.load()),
      takeUntilDestroyed(this.destroy),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: data => {
        if (this.authentication.session()?.userId !== session.userId) return;
        this.applySnapshot(data);
        this.lastSync.set(new Date().toISOString());
        this.message.set('saved');
      },
      error: error => {
        if (this.authentication.session()?.userId !== session.userId) return;
        this.error.set(error.status === 409 ? 'conflict' : 'saveError');
        this.service.load().pipe(takeUntilDestroyed(this.destroy)).subscribe({
          next: data => { if (this.authentication.session()?.userId === session.userId) this.applySnapshot(data); },
          error: () => {},
        });
      },
    });
  }
  private applySnapshot(snapshot: CareSnapshot) {
    this.data.set({
      ...snapshot,
      patients: snapshot.patients.map((p) => {
        const latest = snapshot.records
          .filter((r) => r.patientId === p.id)
          .map((r) => r.recordedAt)
          .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
        return latest && (!p.lastRecordAt || Date.parse(latest) > Date.parse(p.lastRecordAt))
          ? new Patient(
              p.id,
              p.givenName,
              p.familyName,
              p.age,
              p.location,
              p.providerId,
              p.familyIds,
              latest,
              false,
              p.familyDisplayName,
              p.hospital,
              p.userId,
            )
          : p;
      }),
    });
  }
}
