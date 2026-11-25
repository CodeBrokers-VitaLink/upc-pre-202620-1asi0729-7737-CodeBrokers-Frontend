import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Observation } from '../domain/model/observation.entity';
import { ObservationNotification } from '../domain/model/observation-notification.entity';

export interface ObservationsPort {
  observationsFor(patientId: string): Observable<Observation[]>;
  sendObservation(patientId: string, text: string): Observable<Observation>;
  attendPatient(patientId: string, observationId: string): Observable<Observation>;
  notifications(): Observable<ObservationNotification[]>;
  readNotification(id: string): Observable<ObservationNotification>;
}

export const OBSERVATIONS_PORT = new InjectionToken<ObservationsPort>('OBSERVATIONS_PORT');
