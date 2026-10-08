export class Patient {
  constructor(
    public id: string,
    public givenName: string,
    public familyName: string,
    public age: number,
    public location: string,
    public providerId: string,
    public familyIds: string[],
    public lastRecordAt: string | null,
    public outdated: boolean,
    public familyDisplayName?: string,
    public hospital?: string,
  ) {}
  get name(): string {
    return `${this.givenName} ${this.familyName}`;
  }
  get initials(): string {
    return `${this.givenName[0] ?? ''}${this.familyName[0] ?? ''}`;
  }
  get stale(): boolean {
    return !this.lastRecordAt || Date.now() - Date.parse(this.lastRecordAt) > 48 * 3600000;
  }
}
