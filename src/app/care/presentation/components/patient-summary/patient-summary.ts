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
      const level = record ? MeasurementAssessment.level(record, this.store.data().measurementRanges) : 'unknown';
      const range = this.store.data().measurementRanges.find(range => range.id === type && range.unit === record?.unit);
      const reference = range?.systolic && range.diastolic
        ? range.systolic.normalMin + '–' + range.systolic.normalMax + ' / ' + range.diastolic.normalMin + '–' + range.diastolic.normalMax
        : range?.normalMin != null && range.normalMax != null ? range.normalMin + '–' + range.normalMax : null;
      return {type, record, level, reference};
    });
    return {patient, priority, level: priority === 3 ? 'danger' : priority === 2 ? 'warning' : 'normal',
      label: priority === 3 ? 'HIGH' : priority === 2 ? 'MEDIUM' : priority === 1 ? 'LOW' : records.length ? 'noOpenAlerts' : 'noRecords', measurements};
  }).sort((a,b) => b.priority - a.priority));
}
