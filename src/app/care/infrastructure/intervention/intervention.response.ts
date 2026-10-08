import type { AlertStatus } from '../../domain/model/alert.entity';
export interface InterventionResponse {
  id: string;
  alertId: string;
  actor: string;
  actorId?: string;
  role: string;
  from: AlertStatus;
  to: AlertStatus;
  at: string;
  note?: string | null;
}
