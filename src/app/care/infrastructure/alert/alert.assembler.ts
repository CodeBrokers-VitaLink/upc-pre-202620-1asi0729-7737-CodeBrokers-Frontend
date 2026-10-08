import { CareAlert } from '../../domain/model/alert.entity';
import type { AlertResponse } from './alert.response';

/** Maps alerts without serializing derived domain properties. */
export class AlertAssembler {
  static toEntity(value: AlertResponse): CareAlert {
    return new CareAlert(
      value.id,
      value.patientId,
      value.severity,
      value.status,
      value.type,
      value.raisedAt,
      value.recordId,
    );
  }

  static toResponse(value: CareAlert): AlertResponse {
    return {
      id: value.id,
      patientId: value.patientId,
      severity: value.severity,
      status: value.status,
      type: value.type,
      raisedAt: value.raisedAt,
      recordId: value.recordId,
    };
  }
}
