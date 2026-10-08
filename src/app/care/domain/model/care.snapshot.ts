import type { Patient } from './patient.entity';
import type { CareAlert } from './alert.entity';
import type { CareRecord } from './record.entity';
import type { Intervention } from './intervention.entity';
import type { Caregiver } from './caregiver.entity';
import type { MeasurementRange } from './measurement-range.entity';
export interface CareSnapshot {
  patients: Patient[];
  alerts: CareAlert[];
  records: CareRecord[];
  interventions: Intervention[];
  caregivers: Caregiver[];
  measurementRanges: MeasurementRange[];
}
