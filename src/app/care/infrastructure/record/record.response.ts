import type { RecordType } from '../../domain/model/record-type';
export interface RecordResponse {
  id: string;
  patientId: string;
  type: RecordType;
  value: number | string | null;
  unit: string | null;
  recordedAt: string;
  origin: string;
  providerId?: string;
  providerName?: string;
  note: string | null;
}
