import { MeasurementAssessment } from '../../../infrastructure/measurement-range/measurement-assessment';
import { CareRecord } from '../../../domain/model/record.entity';
import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CareAlert } from '../../../domain/model/alert.entity';
import { CareStore } from '../../../application/care.store';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizedDateService } from '../../../../shared/i18n/localized-date.service';
@Component({
  selector: 'app-alert-list',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './alert-list.html',
  styleUrl: './alert-list.css',
})
export class AlertList {
  readonly alerts = input.required<CareAlert[]>();
  readonly role = input('doctor');
  readonly showPatient = input(false);
  readonly store = inject(CareStore);
  readonly dates = inject(LocalizedDateService);
  patient(id: string) {
    return this.store.data().patients.find((p) => p.id === id);
  }
  trigger(alert: CareAlert) { return this.store.data().records.find(record => record.id === alert.recordId && record.patientId === alert.patientId); }
  assessment(record: CareRecord) { return MeasurementAssessment.level(record, this.store.data().measurementRanges); }
  lastActor(id: string) {
    return this.store.interventionsFor(id)[0];
  }
}
