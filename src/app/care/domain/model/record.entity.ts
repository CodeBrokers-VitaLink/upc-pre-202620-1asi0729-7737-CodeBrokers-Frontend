import type { RecordType } from './record-type';
export interface CareRecord {
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
