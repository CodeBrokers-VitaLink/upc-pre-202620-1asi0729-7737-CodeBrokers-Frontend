import type { Contact } from '../../domain/model/contact.entity';
import type { ContactResponse } from './contact.response';

/** Maps contact transport data and domain entities at the infrastructure boundary. */
export class ContactAssembler {
  static toEntity(value: ContactResponse): Contact {
    return {
      id: value.id,
      familyId: value.familyId,
      patientIds: [...value.patientIds],
      name: value.name,
      phone: value.phone,
      email: value.email,
    };
  }
  static toResponse(value: Contact): ContactResponse {
    return {
      id: value.id,
      familyId: value.familyId,
      patientIds: [...value.patientIds],
      name: value.name,
      phone: value.phone,
      email: value.email,
    };
  }
}
