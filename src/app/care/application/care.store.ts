import { AuthenticationStore } from '../../iam/application/authentication.store';
import { UserStore } from '../../iam/application/user.store';
import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap, throwError, map } from 'rxjs';
import { CareService } from '../infrastructure/care/care.service';
import { CareSnapshot } from '../domain/model/care.snapshot';
import { CareAlert, AlertStatus } from '../domain/model/alert.entity';
import { Intervention } from '../domain/model/intervention.entity';
import { Patient } from '../domain/model/patient.entity';
import { CARE_CONTEXT } from '../infrastructure/care/care-context';
@Injectable({ providedIn: 'root' })
export class CareStore {
  private readonly service = inject(CareService);
  private readonly authentication = inject(AuthenticationStore);
  private readonly doctorProfile = inject(UserStore);
  private readonly context = inject(CARE_CONTEXT);
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
  readonly currentCaregiver = computed(() => this.data().caregivers.find(c => c.id === this.context.familyId));
  readonly professionalPatients = computed(() =>
    this.data().patients.filter((p) => p.providerId === this.context.providerId),
  );
  readonly familyPatients = computed(() =>
    this.data().patients.filter((p) => p.familyIds.includes(this.context.familyId)),
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
  load() {
    if (this.loading() || this.saving()) return;
    this.loading.set(true);
    this.error.set('');
    this.service
      .load()
      .pipe(
        takeUntilDestroyed(this.destroy),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (data) => {
          this.applySnapshot(data);
          this.lastSync.set(new Date().toISOString());
        },
        error: () => this.error.set('loadError'),
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
    // Read current shared state before writing to avoid silently duplicating another person's work.
    let event: Intervention;
    this.service
      .findAlert(alert.id)
      .pipe(
        switchMap((current) => {
          if (current.status !== alert.status || current.status === 'ATTENDED')
            return throwError(() => new Error('conflict'));
          event = {
            id: `I-${crypto.randomUUID()}`,
            alertId: alert.id,
            actor: doctor.name,
            actorId: doctor.id,
            role: 'professional',
            from: current.status,
            to,
            at: new Date().toISOString(),
            note: note.trim(),
          };
          // JSON Server has no transactions. Persist the actual status before its audit event;
          // on a partial failure, refresh shared state and report the incomplete operation.
          return this.service
            .updateAlert(alert.id, to)
            .pipe(
              switchMap((updated) =>
                this.service.addIntervention(event).pipe(map(() => updated)),
              ),
            );
        }),
        takeUntilDestroyed(this.destroy),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (updated) => {
          this.data.update((d) => ({
            ...d,
            alerts: d.alerts.map((a) => (a.id === updated.id ? updated : a)),
            interventions: [...d.interventions, event],
          }));
          this.message.set('saved');
        },
        error: (err) => {
          this.error.set(err.message === 'conflict' ? 'conflict' : 'saveError');
          this.service
            .load()
            .pipe(takeUntilDestroyed(this.destroy))
            .subscribe({ next: (d) => this.applySnapshot(d), error: () => {} });
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
            )
          : p;
      }),
    });
  }
}
