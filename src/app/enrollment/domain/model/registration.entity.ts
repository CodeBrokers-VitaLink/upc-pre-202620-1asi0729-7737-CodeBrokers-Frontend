export interface AccountDetails { name: string; email: string; password: string; phone: string; }
export interface DoctorRegistration {
  account: AccountDetails;
  specialty: string;
  professionalLicense: string;
  worksInClinic: boolean;
  clinicId: string | null;
}
export interface InitialVitalSigns {
  heartRate: number | null;
  oxygen: number | null;
  glucose: number | null;
  systolic: number | null;
  diastolic: number | null;
}
export interface PatientEnrollment {
  givenName: string;
  familyName: string;
  age: number | null;
  location: string;
  familyDisplayName: string;
  serviceType: 'clinic' | 'independent';
  clinicId: string | null;
  doctorId: string | null;
  consent: boolean;
  initialVitals: InitialVitalSigns;
}
export interface FamilyRegistration { account: AccountDetails; patient: PatientEnrollment; }

export function validAccount(value: AccountDetails): boolean {
  return !!value.name.trim() && value.name.length <= 100 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) &&
    value.password.length >= 8 && value.password.length <= 72 && !!value.phone.trim();
}
export function validDoctor(value: DoctorRegistration): boolean {
  return validAccount(value.account) && !!value.specialty.trim() && /^\d{4,10}$/.test(value.professionalLicense) &&
    (!value.worksInClinic || !!value.clinicId);
}
export function validVitals(value: InitialVitalSigns): boolean {
  const within = (n: number | null, min: number, max: number): n is number => n !== null && Number.isFinite(n) && n >= min && n <= max;
  return within(value.heartRate, 20, 300) && within(value.oxygen, 1, 100) && within(value.glucose, 20, 1000) &&
    within(value.systolic, 40, 300) && within(value.diastolic, 20, 200) && value.systolic > value.diastolic;
}
export function validFamily(value: FamilyRegistration): boolean {
  const p = value.patient;
  return validAccount(value.account) && !!p.givenName.trim() && !!p.familyName.trim() &&
    p.age !== null && Number.isInteger(p.age) && p.age >= 0 && p.age <= 120 && !!p.location.trim() &&
    !!p.doctorId && (p.serviceType !== 'clinic' || !!p.clinicId) && p.consent && validVitals(p.initialVitals);
}
