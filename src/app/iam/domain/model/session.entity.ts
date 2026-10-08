import { Role } from './role.entity';
export class Session {
  constructor(readonly userId: string, readonly role: Role) {}
}
