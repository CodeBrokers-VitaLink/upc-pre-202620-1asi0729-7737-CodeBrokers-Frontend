import type { Clinic } from '../../domain/model/clinic.entity';
import type { DoctorOption } from '../../domain/model/doctor-option.entity';
import type { ClinicResponse, DoctorOptionResponse } from './catalog.response';
export class CatalogAssembler {
  static clinic(value: ClinicResponse): Clinic { return { id: value.id, name: value.name }; }
  static doctor(value: DoctorOptionResponse): DoctorOption { return { id: value.id, name: value.name, specialty: value.specialty, practiceType: value.practiceType, clinicId: value.clinicId }; }
}
