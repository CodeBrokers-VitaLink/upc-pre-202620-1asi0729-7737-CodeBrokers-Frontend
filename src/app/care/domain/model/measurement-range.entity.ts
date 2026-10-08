export interface NumericRange {
  normalMin: number; normalMax: number;
  dangerBelow?: number | null; dangerFrom?: number | null; dangerAtOrBelow?: number | null;
}
export interface MeasurementRange {
  id: string; unit: string; normalMin?: number; normalMax?: number;
  dangerBelow?: number | null; dangerFrom?: number | null; dangerAtOrBelow?: number | null;
  systolic?: NumericRange; diastolic?: NumericRange;
}
