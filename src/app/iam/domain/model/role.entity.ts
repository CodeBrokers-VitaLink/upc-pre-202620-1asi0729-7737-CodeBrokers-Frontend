/** Roles supported by the application. */
export type RoleCode = 'doctor' | 'family';
export class Role {
  constructor(readonly code: RoleCode) {}
  get home(): string { return '/' + this.code + '/dashboard'; }
}
