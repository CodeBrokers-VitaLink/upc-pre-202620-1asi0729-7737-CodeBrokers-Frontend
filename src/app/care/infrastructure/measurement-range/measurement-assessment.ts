import type { CareRecord } from '../../domain/model/record.entity';
import type { MeasurementRange, NumericRange } from '../../domain/model/measurement-range.entity';
export type MeasurementLevel = 'normal' | 'warning' | 'danger' | 'unknown';
/** Visual classification using only reference thresholds returned by the API. */
export class MeasurementAssessment {
  static level(record: CareRecord, ranges: MeasurementRange[]): MeasurementLevel {
    const range = ranges.find(r=>r.id===record.type && r.unit===record.unit);
    if(!range || record.value===null || String(record.value).trim()==='') return 'unknown';
    if(record.type==='bloodPressure') {
      if(typeof record.value!=='string'||!/^\d{2,3}\/\d{2,3}$/.test(record.value)||!range.systolic||!range.diastolic) return 'unknown';
      const [s,d]=record.value.split('/').map(Number);
      if(s<=d||d<=0)return 'unknown';
      const levels=[this.numeric(s,range.systolic),this.numeric(d,range.diastolic)];
      return levels.includes('unknown')?'unknown':levels.includes('danger')?'danger':levels.includes('warning')?'warning':'normal';
    }
    const value=Number(record.value);
    if(!Number.isFinite(value)||value<=0||(record.type==='oxygen'&&value>100)||range.normalMin===undefined||range.normalMax===undefined)return 'unknown';
    return this.numeric(value,{...range,normalMin:range.normalMin,normalMax:range.normalMax});
  }
  private static numeric(value:number,r:NumericRange):MeasurementLevel {
    if(!Number.isFinite(r.normalMin)||!Number.isFinite(r.normalMax)||r.normalMin>r.normalMax)return 'unknown';
    if((r.dangerBelow!=null&&value<r.dangerBelow)||(r.dangerFrom!=null&&value>=r.dangerFrom)||(r.dangerAtOrBelow!=null&&value<=r.dangerAtOrBelow))return 'danger';
    return value>=r.normalMin&&value<=r.normalMax?'normal':'warning';
  }
}
