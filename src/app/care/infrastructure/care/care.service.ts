import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AlertStatus } from '../../domain/model/alert.entity';
import { Intervention } from '../../domain/model/intervention.entity';
import type { PatientResponse } from '../patient/patient.response';
import type { AlertResponse } from '../alert/alert.response';
import type { RecordResponse } from '../record/record.response';
import type { InterventionResponse } from '../intervention/intervention.response';
import { PatientAssembler } from '../patient/patient.assembler';
import { AlertAssembler } from '../alert/alert.assembler';
import { RecordAssembler } from '../record/record.assembler';
import { InterventionAssembler } from '../intervention/intervention.assembler';
import type { CaregiverResponse } from '../caregiver/caregiver.response';
import type { MeasurementRangeResponse } from '../measurement-range/measurement-range.response';
import { CaregiverAssembler } from '../caregiver/caregiver.assembler';
import { MeasurementRangeAssembler } from '../measurement-range/measurement-range.assembler';
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});
@Injectable({ providedIn: 'root' })
export class CareService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_URL);
  load() {
    return forkJoin({
      patients: this.http.get<PatientResponse[]>(`${this.url}/patients`),
      alerts: this.http.get<AlertResponse[]>(`${this.url}/alerts`),
      records: this.http.get<RecordResponse[]>(`${this.url}/records`),
      interventions: this.http.get<InterventionResponse[]>(`${this.url}/interventions`),
      caregivers: this.http.get<CaregiverResponse[]>(`${this.url}/caregivers`),
      measurementRanges: this.http.get<MeasurementRangeResponse[]>(`${this.url}/measurementRanges`),
    }).pipe(
      map((r) => ({
        patients: r.patients.map(PatientAssembler.toEntity),
        alerts: r.alerts.map(AlertAssembler.toEntity),
        records: r.records.map(RecordAssembler.toEntity),
        interventions: r.interventions.map(InterventionAssembler.toEntity),
        caregivers: r.caregivers.map(CaregiverAssembler.toEntity),
        measurementRanges: r.measurementRanges.map(MeasurementRangeAssembler.toEntity),
      })),
    );
  }
  findAlert(id: string) {
    return this.http
      .get<AlertResponse>(`${this.url}/alerts/${encodeURIComponent(id)}`)
      .pipe(map(AlertAssembler.toEntity));
  }

  updateAlert(id: string, status: AlertStatus) {
    return this.http
      .patch<AlertResponse>(`${this.url}/alerts/${encodeURIComponent(id)}`, { status })
      .pipe(map(AlertAssembler.toEntity));
  }
  addIntervention(value: Intervention) {
    return this.http
      .post<InterventionResponse>(
        `${this.url}/interventions`,
        InterventionAssembler.toResponse(value),
      )
      .pipe(map(InterventionAssembler.toEntity));
  }

}
