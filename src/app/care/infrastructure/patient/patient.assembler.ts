import { Patient } from '../../domain/model/patient.entity';
import type { PatientResponse } from './patient.response';

/** Maps patient transport data to the domain without sharing mutable family IDs. */
export class PatientAssembler {
  static toEntity(value: PatientResponse): Patient {
    return new Patient(
      value.id,
      value.givenName,
      value.familyName,
      value.age,
      value.location,
      value.providerId,
      [...value.familyIds],
      value.lastRecordAt,
      value.outdated,
      value.familyDisplayName,
      value.hospital,
    );
  }

  static toResponse(value: Patient): PatientResponse {
    return {
      id: value.id,
      givenName: value.givenName,
      familyName: value.familyName,
      age: value.age,
      location: value.location,
      providerId: value.providerId,
      familyIds: [...value.familyIds],
      lastRecordAt: value.lastRecordAt,
      outdated: value.outdated,
      familyDisplayName: value.familyDisplayName,
      hospital: value.hospital,
    };
  }
}
