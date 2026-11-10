import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { PatientSummary } from './patient-summary';
import { CareStore } from '../../../application/care.store';
import { Patient } from '../../../domain/model/patient.entity';
import { CareRecord } from '../../../domain/model/record.entity';
import { MeasurementRange } from '../../../domain/model/measurement-range.entity';

const ranges: MeasurementRange[] = [
 { id: 'heartRate', unit: 'bpm', normalMin: 60, normalMax: 100, dangerBelow: 40, dangerFrom: 150 },
 { id: 'oxygen', unit: '%', normalMin: 95, normalMax: 100, dangerAtOrBelow: 88 },
 { id: 'glucose', unit: 'mg/dL', normalMin: 70, normalMax: 99, dangerBelow: 55, dangerFrom: 300 },
 { id: 'bloodPressure', unit: 'mmHg', systolic: { normalMin:90,normalMax:119.99,dangerFrom:180.01 },diastolic:{normalMin:60,normalMax:79.99,dangerFrom:120.01} },
];
describe('Patient summary measurement colors', () => {
 function setup(pulse: number, availableRanges = ranges, age = 90) {
  const patient = new Patient('P-1','Test','Patient',age,'Lima','DR-1',[],null,false);
  const readings: CareRecord[] = [
   {type:'heartRate',value:pulse,unit:'bpm'}, {type:'oxygen',value:96,unit:'%'},
   {type:'glucose',value:80,unit:'mg/dL'}, {type:'bloodPressure',value:'100/75',unit:'mmHg'},
  ].map((v,i)=>({...v,id:String(i),patientId:'P-1',recordedAt:'2026-11-09T12:00:00Z',origin:'manual',note:null})) as CareRecord[];
  TestBed.configureTestingModule({providers:[provideTranslateService(),{provide:CareStore,useValue:{
   professionalPatients:signal([patient]), alertsFor:()=>[], recordsFor:()=>readings,
   data:signal({measurementRanges:availableRanges}),
  }}]});
  return TestBed.runInInjectionContext(()=>new PatientSummary()).cards()[0];
 }
 it('marks 200 bpm and the entire card red without an open alert',()=>{
  const card=setup(200);
  expect(card.measurements[0].level).toBe('danger');expect(card.level).toBe('danger');
 });
 it('uses yellow for moderately abnormal pulse',()=>expect(setup(110).level).toBe('warning'));
 it('uses green when all four readings are in range',()=>expect(setup(70).level).toBe('normal'));
 it('uses gray instead of green without reference ranges',()=>expect(setup(200,[]).level).toBe('unknown'));
 it('does not classify a child using adult ranges',()=>expect(setup(110,ranges,5).level).toBe('unknown'));
});
