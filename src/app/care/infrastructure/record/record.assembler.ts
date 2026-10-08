import type { CareRecord } from '../../domain/model/record.entity';
import type { RecordResponse } from './record.response';

/** Maps record transport data and domain entities at the infrastructure boundary. */
export class RecordAssembler {
  static toEntity(value: RecordResponse): CareRecord {
    return {
      id: value.id,
      patientId: value.patientId,
      type: value.type,
      value: value.value,
      unit: value.unit,
      recordedAt: value.recordedAt,
      origin: value.origin,
      providerId: value.providerId,
      providerName: value.providerName,
      note: value.note,
    };
  }
  static toResponse(value: CareRecord): RecordResponse {
    return {
      id: value.id,
      patientId: value.patientId,
      type: value.type,
      value: value.value,
      unit: value.unit,
      recordedAt: value.recordedAt,
      origin: value.origin,
      providerId: value.providerId,
      providerName: value.providerName,
      note: value.note,
    };
  }
}
