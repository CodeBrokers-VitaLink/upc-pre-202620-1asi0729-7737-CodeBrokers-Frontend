export interface DoctorOption {
  readonly id: string;
  readonly name: string;
  readonly specialty: string;
  readonly practiceType: 'clinic' | 'independent';
  readonly clinicId: string | null;
}
