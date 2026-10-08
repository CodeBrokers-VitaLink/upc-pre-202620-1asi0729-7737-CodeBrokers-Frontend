import type { MeasurementRange } from '../../domain/model/measurement-range.entity';
import type { MeasurementRangeResponse } from './measurement-range.response';
export class MeasurementRangeAssembler {
  static toEntity(r: MeasurementRangeResponse): MeasurementRange {
    return {id:r.id,unit:r.unit,normalMin:r.normalMin,normalMax:r.normalMax,dangerBelow:r.dangerBelow,dangerFrom:r.dangerFrom,dangerAtOrBelow:r.dangerAtOrBelow,systolic:r.systolic?{...r.systolic}:undefined,diastolic:r.diastolic?{...r.diastolic}:undefined};
  }
  static toResponse(r: MeasurementRange): MeasurementRangeResponse { return this.toEntity(r); }
}
