import type { AccountDetails, DoctorRegistration, FamilyRegistration } from '../../domain/model/registration.entity';
export class RegistrationAssembler {
  private static account(value: AccountDetails) { return { name: value.name.trim(), email: value.email.trim().toLowerCase(), password: value.password, phone: value.phone.trim() }; }
  static doctor(value: DoctorRegistration) {
    return { ...this.account(value.account), role: 'doctor', specialty: value.specialty.trim(), professionalLicense: value.professionalLicense,
      practiceType: value.worksInClinic ? 'clinic' : 'independent', clinicId: value.worksInClinic ? value.clinicId : null };
  }
  static family(value: FamilyRegistration) {
    const p = value.patient;
    return { ...this.account(value.account), patient: {
      givenName: p.givenName.trim(), familyName: p.familyName.trim(), age: p.age, location: p.location.trim(),
      familyDisplayName: p.familyDisplayName.trim() || null, serviceType: p.serviceType,
      clinicId: p.serviceType === 'clinic' ? p.clinicId : null, doctorId: p.doctorId, consent: p.consent,
      initialVitals: { ...p.initialVitals },
    } };
  }
}
