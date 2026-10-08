import type { RecordType } from './record-type';
export type AlertStatus = 'PENDING' | 'IN_REVIEW' | 'ATTENDED';
export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';
export class CareAlert {
  constructor(
    public id: string,
    public patientId: string,
    public severity: Severity,
    public status: AlertStatus,
    public type: RecordType,
    public raisedAt: string,
    public recordId?: string | null,
  ) {}
  get open(): boolean {
    return this.status !== 'ATTENDED';
  }
  get priority(): number {
    return { HIGH: 3, MEDIUM: 2, LOW: 1 }[this.severity];
  }
}
