import type { Intervention } from '../../domain/model/intervention.entity';
import type { InterventionResponse } from './intervention.response';

/** Maps intervention transport data and domain entities at the infrastructure boundary. */
export class InterventionAssembler {
  static toEntity(value: InterventionResponse): Intervention {
    return {
      id: value.id,
      alertId: value.alertId,
      actor: value.actor,
      actorId: value.actorId,
      role: value.role,
      from: value.from,
      to: value.to,
      at: value.at,
      note: value.note,
    };
  }
  static toResponse(value: Intervention): InterventionResponse {
    return {
      id: value.id,
      alertId: value.alertId,
      actor: value.actor,
      actorId: value.actorId,
      role: value.role,
      from: value.from,
      to: value.to,
      at: value.at,
      note: value.note,
    };
  }
}
