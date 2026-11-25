export interface ObservationNotification {
  id: string;
  patientId: string;
  observationId: string;
  doctorName: string;
  createdAt: string;
  readAt: string | null;
}
