export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'family' | 'patient';
  phone?: string | null;
  hospital?: string | null;
}
