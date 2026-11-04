export interface PatientResponse {
  id: string;
  givenName: string;
  familyName: string;
  age: number;
  location: string;
  providerId: string | null;
  familyIds: string[];
  lastRecordAt: string | null;
  outdated: boolean;
  familyDisplayName?: string;
  hospital?: string | null;
  userId?: string | null;
}
