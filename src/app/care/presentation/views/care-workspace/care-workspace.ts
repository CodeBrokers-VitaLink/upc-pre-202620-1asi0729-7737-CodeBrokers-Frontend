import { UserStore } from '../../../../iam/application/user.store';
import { PatientSummary } from '../../components/patient-summary/patient-summary';
import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CareStore } from '../../../application/care.store';
import { CareAlert, AlertStatus } from '../../../domain/model/alert.entity';
import { MeasurementAssessment, MeasurementLevel } from '../../../infrastructure/measurement-range/measurement-assessment';
import type { CareRecord } from '../../../domain/model/record.entity';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizedDateService } from '../../../../shared/i18n/localized-date.service';
import { AlertList } from '../../components/alert-list/alert-list';
import { CARE_CONTEXT } from '../../../infrastructure/care/care-context';
@Component({
  imports: [
    RouterLink,
    FormsModule,
    TranslatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    AlertList,
    PatientSummary,

  ],
  templateUrl: './care-workspace.html',
  styleUrl: './care-workspace.css',
})
export class CareWorkspace {
  readonly store = inject(CareStore);
  readonly doctorProfile = inject(UserStore);

  readonly dates = inject(LocalizedDateService);
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data,
  });
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly role = computed(() => this.routeData()['role'] as string);
  readonly view = computed(() => this.routeData()['view'] as string);
  readonly patients = computed(() =>
    this.role() === 'doctor' ? this.store.professionalPatients() : this.store.familyPatients(),
  );
  readonly selectedId = signal(sessionStorage.getItem('vitalink-patient') ?? '');
  readonly patient = computed(() => {
    const alertId = this.params().get('alertId');
    const id =
      this.params().get('id') ??
      (alertId
        ? this.store.data().alerts.find((a) => a.id === alertId)?.patientId
        : this.selectedId());
    return (
      this.patients().find((p) => p.id === id) ??
      (this.view().includes(':') ? undefined : this.patients()[0])
    );
  });
  readonly alert = computed(() =>
    this.store
      .data()
      .alerts.find(
        (a) => a.id === this.params().get('alertId') && a.patientId === this.patient()?.id,
      ),
  );
  readonly records = computed(() => this.store.recordsFor(this.patient()?.id ?? ''));
  readonly latestReview = computed(() => this.records().find(record => record.origin === 'professional' && record.providerName));
  readonly measurementFilter = signal<MeasurementLevel | 'all'>('all');
  assessment(record: CareRecord) { return MeasurementAssessment.level(record,this.store.data().measurementRanges); }
  readonly latest = computed(() =>
    this.records().filter(
      (r, i, rs) =>
        ['heartRate', 'oxygen', 'bloodPressure', 'glucose'].includes(r.type) &&
        rs.findIndex((x) => x.type === r.type) === i,
    ),
  );
  readonly patientAlerts = computed(() => this.store.alertsFor(this.patient()?.id ?? ''));
  readonly filteredMeasurements = computed(() => this.latest().filter(r => this.measurementFilter() === 'all' || this.assessment(r) === this.measurementFilter()));
  readonly needsAttention = computed(()=>this.openAlerts().length>0||this.latest().some(r=>['warning','danger'].includes(this.assessment(r))));
  readonly week = computed(()=>{
    const end=new Date();const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima'});
    return Array.from({length:7},(_,i)=>{
      const date=new Date(end.getTime()-(6-i)*86400000);const key=formatter.format(date);
      const records=this.records().filter(r=>formatter.format(new Date(r.recordedAt))===key);
      const levels=records.filter(r=>r.type!=='note').map(r=>this.assessment(r));
      return {date:date.toISOString(),day:new Intl.DateTimeFormat(this.dates.language(),{timeZone:'America/Lima',weekday:'short'}).format(date),number:new Intl.DateTimeFormat(this.dates.language(),{timeZone:'America/Lima',day:'numeric'}).format(date),state:levels.length===0?'unknown':levels.some(l=>l==='warning'||l==='danger')?'warning':levels.some(l=>l==='unknown')?'unknown':'normal'};
    });
  });
  readonly openAlerts = computed(() => this.patientAlerts().filter((a) => a.open));
  readonly query = signal('');
  readonly patientStatus = signal('ALL');
  readonly staleOnly = signal(false);
  readonly filteredPatients = computed(() => {
    const norm = (v: string) =>
      v
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    return this.patients().filter(
      (p) =>
        norm(`${p.name} ${p.id}`).includes(norm(this.query())) &&
        (!this.staleOnly() || p.stale) &&
        (this.patientStatus() === 'ALL' ||
          (this.patientStatus() === 'OPEN'
            ? this.store.alertsFor(p.id).some((a) => a.open)
            : !this.store.alertsFor(p.id).some((a) => a.open))),
    );
  });
  readonly alertStatus = signal('PENDING');
  readonly order = signal('priority');
  readonly dashboardAlerts = computed(() =>
    this.store
      .professionalAlerts()
      .filter((a) => this.alertStatus() === 'ALL' || a.status === this.alertStatus())
      .sort((a, b) =>
        this.order() === 'priority'
          ? b.priority - a.priority || Date.parse(b.raisedAt) - Date.parse(a.raisedAt)
          : Date.parse(b.raisedAt) - Date.parse(a.raisedAt),
      ),
  );
  readonly pending = computed(
    () => this.store.professionalAlerts().filter((a) => a.status === 'PENDING').length,
  );
  readonly reviews = computed(
    () => this.store.professionalAlerts().filter((a) => a.status === 'IN_REVIEW').length,
  );

  observation = '';
  validation = '';
  readonly familyId = inject(CARE_CONTEXT).familyId;
  constructor() {
    this.store.load();
    if (this.role() === 'doctor') this.doctorProfile.load();
  }
  get title() {
    return (
      (
        {
          dashboard: this.role() === 'doctor' ? 'summaryTitle' : 'familyHome',
          patients: 'patients',
          'patients/:id': 'detail',
          'alerts/:alertId': 'alertDetail',
          network: 'network',

        } as Record<string, string>
      )[this.view()] ?? 'summary'
    );
  }
  select(id: string) {
    this.selectedId.set(id);
    sessionStorage.setItem('vitalink-patient', id);
  }
  clear() {
    this.query.set('');
    this.patientStatus.set('ALL');
    this.staleOnly.set(false);
  }
  countOpen(id: string) {
    return this.store.alertsFor(id).filter((a) => a.open).length;
  }
  lastRecord(id: string) {
    return (
      this.store.recordsFor(id)[0]?.recordedAt ??
      this.patients().find((p) => p.id === id)?.lastRecordAt
    );
  }
  related(a: CareAlert) {
    if (a.recordId) return this.records().find((r) => r.id === a.recordId);
    return this.records()
      .filter((r) => r.type === a.type)
      .sort(
        (x, y) =>
          Math.abs(Date.parse(x.recordedAt) - Date.parse(a.raisedAt)) -
          Math.abs(Date.parse(y.recordedAt) - Date.parse(a.raisedAt)),
      )[0];
  }
  status(to: AlertStatus) {
    const a = this.alert();
    if (!a) return;
    this.validation = '';
    if (
      (to === 'ATTENDED' && this.role() === 'doctor' && !this.observation.trim())
    ) {
      this.validation = 'observationRequired';
      return;
    }
    this.store.changeStatus(
      a,
      to,
      this.observation,
    );
  }


}
