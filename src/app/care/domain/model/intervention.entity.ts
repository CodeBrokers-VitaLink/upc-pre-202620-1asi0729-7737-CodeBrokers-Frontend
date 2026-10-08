import type { AlertStatus } from './alert.entity';
export interface Intervention {
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
