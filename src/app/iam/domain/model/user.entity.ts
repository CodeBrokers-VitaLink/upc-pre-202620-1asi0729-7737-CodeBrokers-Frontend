import { Role } from './role.entity';
export class User {
  constructor(readonly id: string, readonly name: string, readonly email: string, readonly role: Role, readonly phone: string | null = null, readonly hospital: string | null = null) {}
}
