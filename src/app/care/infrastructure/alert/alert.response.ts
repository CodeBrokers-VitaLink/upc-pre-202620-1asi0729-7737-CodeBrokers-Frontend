import type { AlertStatus, Severity } from '../../domain/model/alert.entity';
import type { RecordType } from '../../domain/model/record-type';
export interface AlertResponse {
  id: string;
  patientId: string;
  severity: Severity;
  status: AlertStatus;
  type: RecordType;
  raisedAt: string;
  recordId?: string | null;
}
