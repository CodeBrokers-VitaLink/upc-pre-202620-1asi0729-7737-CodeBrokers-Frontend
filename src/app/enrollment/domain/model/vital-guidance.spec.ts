import { describe, it, expect } from 'vitest';
import { vitalStatus, vitalLimits } from './vital-guidance';
import { InitialVitalSigns, validVitals } from './registration.entity';
const baseline: InitialVitalSigns = { heartRate: 70, oxygen: 97, glucose: 90, systolic: 110, diastolic: 70 };
describe('Vital measurement guidance', () => {
  it('accepts severe readings rather than treating them as impossible', () => {
    const values = { ...baseline, heartRate: 200, oxygen: 67 };
    expect(validVitals(values)).toBe(true);
    expect(vitalStatus('heartRate', values, 40)).toBe('highAlert');
    expect(vitalStatus('oxygen', values, 40)).toBe('highAlert');
  });
  it('rejects impossible percentage and values outside supported ranges', () => {
    for (const field of Object.keys(vitalLimits) as (keyof InitialVitalSigns)[]) {
      expect(validVitals({ ...baseline, [field]: vitalLimits[field].max + 1 })).toBe(false);
      expect(vitalStatus(field, { ...baseline, [field]: vitalLimits[field].min - 1 }, 40)).toBe('invalid');
    }
  });
  it('explains an inverted blood pressure under both fields', () => {
    const values = { ...baseline, systolic: 56, diastolic: 67 };
    expect(validVitals(values)).toBe(false);
    expect(vitalStatus('systolic', values, 40)).toBe('pressureOrder');
    expect(vitalStatus('diastolic', values, 40)).toBe('pressureOrder');
  });
  it('does not apply adult classifications to children or unknown ages', () => {
    expect(vitalStatus('heartRate', baseline, 5)).toBe('adultOnly');
    expect(vitalStatus('oxygen', baseline, null)).toBe('adultOnly');
  });
  it('does not call glucose normal without fasting context', () => {
    expect(vitalStatus('glucose', baseline, 40)).toBe('context');
    expect(vitalStatus('glucose', { ...baseline, glucose: 54 }, 40)).toBe('highAlert');
    expect(vitalStatus('glucose', { ...baseline, glucose: 55 }, 40)).toBe('review');
    expect(vitalStatus('glucose', { ...baseline, glucose: 300 }, 40)).toBe('highAlert');
  });
  it('uses both blood pressure values to detect high readings', () => {
    const values = { ...baseline, systolic: 190, diastolic: 80 };
    expect(vitalStatus('diastolic', values, 40)).toBe('highAlert');
    expect(vitalStatus('systolic', values, 40)).toBe('highAlert');
  });
});
