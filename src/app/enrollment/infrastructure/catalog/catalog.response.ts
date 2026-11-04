export interface ClinicResponse { id: string; name: string; }
export interface DoctorOptionResponse { id: string; name: string; specialty: string; practiceType: 'clinic' | 'independent'; clinicId: string | null; }
