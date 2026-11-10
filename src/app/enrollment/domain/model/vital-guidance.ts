import { InitialVitalSigns } from './registration.entity';

export type VitalField = keyof InitialVitalSigns;
export const vitalLimits: Record<VitalField, { min: number; max: number }> = {
  heartRate: { min: 20, max: 300 }, oxygen: { min: 1, max: 100 },
  glucose: { min: 20, max: 1000 }, systolic: { min: 40, max: 300 },
  diastolic: { min: 20, max: 200 },
};
export type VitalStatus = 'empty' | 'invalid' | 'adultOnly' | 'normal' | 'review' | 'highAlert' | 'context' | 'pressureOrder';
export function vitalStatus(field: VitalField, values: InitialVitalSigns, age: number | null): VitalStatus {
  const value = values[field];
  if (value === null) return 'empty';
  const { min, max } = vitalLimits[field];
  if (!Number.isFinite(value) || value < min || value > max) return 'invalid';
  if ((field === 'systolic' || field === 'diastolic') &&
      values.systolic !== null && values.diastolic !== null && values.systolic <= values.diastolic) return 'pressureOrder';
  if (age === null || age < 18) return 'adultOnly';
  switch (field) {
    case 'heartRate': return value < 40 || value >= 150 ? 'highAlert' : value >= 60 && value <= 100 ? 'normal' : 'review';
    case 'oxygen': return value <= 88 ? 'highAlert' : value >= 95 ? 'normal' : 'review';
    case 'glucose': return value < 55 || value >= 300 ? 'highAlert' : value < 70 ? 'review' : 'context';
    case 'systolic':
    case 'diastolic': {
      const s = values.systolic, d = values.diastolic;
      if (s === null || d === null) return 'context';
      if (s < vitalLimits.systolic.min || s > vitalLimits.systolic.max ||
          d < vitalLimits.diastolic.min || d > vitalLimits.diastolic.max) return 'invalid';
      if (s > 180 || d > 120) return 'highAlert';
      return s >= 90 && s < 120 && d >= 60 && d < 80 ? 'normal' : 'review';
    }
  }
}
