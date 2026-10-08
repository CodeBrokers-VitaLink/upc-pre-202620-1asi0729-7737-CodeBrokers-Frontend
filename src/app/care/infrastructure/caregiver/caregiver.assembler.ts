import type { Caregiver } from '../../domain/model/caregiver.entity';
import type { CaregiverResponse } from './caregiver.response';
export class CaregiverAssembler {
  static toEntity(r: CaregiverResponse): Caregiver { return {id:r.id,name:r.name,phone:r.phone,email:r.email,patientIds:[...r.patientIds]}; }
  static toResponse(r: Caregiver): CaregiverResponse { return {id:r.id,name:r.name,phone:r.phone,email:r.email,patientIds:[...r.patientIds]}; }
}
