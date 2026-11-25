export interface Observation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  text: string;
  createdAt: string;
  attendedAt: string | null;
}
