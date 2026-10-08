import { InjectionToken } from '@angular/core';
export interface CareContext {
  providerId: string;
  familyId: string;
}
export const CARE_CONTEXT = new InjectionToken<CareContext>('CARE_CONTEXT');
