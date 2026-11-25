import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ObservationsPort } from '../application/observations.port';
import { Observation } from '../domain/model/observation.entity';
import { ObservationNotification } from '../domain/model/observation-notification.entity';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ObservationsHttpService implements ObservationsPort {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private observationsUrl(patientId: string): string {
    return this.api + '/patients/' + encodeURIComponent(patientId) + '/observations';
  }

  observationsFor(patientId: string) {
    return this.http.get<Observation[]>(this.observationsUrl(patientId));
  }

  sendObservation(patientId: string, text: string) {
    return this.http.post<Observation>(this.observationsUrl(patientId), { text });
  }

  attendPatient(patientId: string, observationId: string) {
    return this.http.post<Observation>(
      this.observationsUrl(patientId) + '/' + encodeURIComponent(observationId) + '/attend', {});
  }

  notifications() {
    return this.http.get<ObservationNotification[]>(this.api + '/notifications');
  }

  readNotification(id: string) {
    return this.http.patch<ObservationNotification>(
      this.api + '/notifications/' + encodeURIComponent(id) + '/read', {});
  }
}
