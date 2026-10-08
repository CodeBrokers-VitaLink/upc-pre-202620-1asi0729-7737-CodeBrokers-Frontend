export interface NumericRangeResponse {
  normalMin: number; normalMax: number;
  dangerBelow?: number | null; dangerFrom?: number | null; dangerAtOrBelow?: number | null;
}
export interface MeasurementRangeResponse {
  id: string; unit: string; normalMin?: number; normalMax?: number;
  dangerBelow?: number | null; dangerFrom?: number | null; dangerAtOrBelow?: number | null;
  systolic?: NumericRangeResponse; diastolic?: NumericRangeResponse;
}
