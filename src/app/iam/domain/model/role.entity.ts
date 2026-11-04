/** Roles supported by the application. */
export type RoleCode = 'doctor' | 'family' | 'patient';
export class Role {
  constructor(readonly code: RoleCode) {}
  get home(): string { return '/' + this.code + '/dashboard'; }
}
