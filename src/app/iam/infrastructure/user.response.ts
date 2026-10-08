export interface UserResponse {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'doctor' | 'family';
  phone?: string | null;
  hospital?: string | null;
}
