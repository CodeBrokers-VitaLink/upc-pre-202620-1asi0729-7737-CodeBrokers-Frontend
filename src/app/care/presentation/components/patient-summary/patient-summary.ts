import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CareStore } from '../../../application/care.store';
import { MeasurementAssessment } from '../../../infrastructure/measurement-range/measurement-assessment';
import { LocalizedDateService } from '../../../../shared/i18n/localized-date.service';
@Component({
  selector: 'app-patient-summary',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './patient-summary.html',
  styleUrl: './patient-summary.css',
})
export class PatientSummary {
  private readonly store = inject(CareStore);
  readonly dates = inject(LocalizedDateService);
  readonly cards = computed(() => this.store.professionalPatients().map(patient => {
    const open = this.store.alertsFor(patient.id).filter(alert => alert.open);
    const priority = Math.max(0, ...open.map(alert => alert.priority));
    const records = this.store.recordsFor(patient.id);
    const measurements = ['heartRate', 'oxygen', 'glucose', 'bloodPressure'].map(type => {
      const record = records.find(record => record.type === type);
      const level = record && patient.age >= 18 ? MeasurementAssessment.level(record, this.store.data().measurementRanges) : 'unknown';
      const range = this.store.data().measurementRanges.find(range => range.id === type && range.unit === record?.unit);
      const bound = (value: number) => Number(value.toFixed(2));
      const reference = range?.systolic && range.diastolic
        ? bound(range.systolic.normalMin) + '–' + bound(range.systolic.normalMax) + ' / ' + bound(range.diastolic.normalMin) + '–' + bound(range.diastolic.normalMax)
        : range?.normalMin != null && range.normalMax != null ? range.normalMin + '–' + range.normalMax : null;
      return {type, record, level, reference};
    });
    const levels = measurements.map(measurement => measurement.level);
    const level = priority === 3 || levels.includes('danger') ? 'danger'
      : priority >= 1 || levels.includes('warning') ? 'warning'
      : levels.includes('unknown') ? 'unknown' : 'normal';
    const label = level === 'danger' ? 'patientStatusDanger' : level === 'warning' ? 'patientStatusWarning'
      : level === 'unknown' ? 'patientStatusUnknown' : 'patientStatusNormal';
    const rank = { danger: 3, warning: 2, unknown: 1, normal: 0 }[level];
    return {patient, priority: rank, level, label, measurements};
  }).sort((a,b) => b.priority - a.priority));
}
