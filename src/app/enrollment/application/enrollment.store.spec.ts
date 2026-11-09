import { TestBed } from '@angular/core/testing';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { EnrollmentStore } from './enrollment.store';
import { ENROLLMENT_PORT } from './enrollment.port';
import { DoctorOption } from '../domain/model/doctor-option.entity';

describe('Registration catalog availability', () => {
  afterEach(() => vi.useRealTimers());
  const clinics = [{ id: 'CL-01', name: 'Clínica Central' }];
  function setup(doctors: Observable<DoctorOption[]>) {
    const port = {
      clinics: () => of(clinics), doctors: () => doctors,
      registerDoctor: () => of(undefined), registerFamily: () => of(undefined),
    };
    TestBed.configureTestingModule({ providers: [EnrollmentStore, { provide: ENROLLMENT_PORT, useValue: port }] });
    return TestBed.inject(EnrollmentStore);
  }
  it('makes clinics available while the doctors request is still pending', () => {
    const doctors = new Subject<DoctorOption[]>();
    const store = setup(doctors);
    store.loadCatalog();
    expect(store.clinics()).toEqual(clinics);
    expect(store.clinicsLoading()).toBe(false);
    expect(store.loading()).toBe(true);
    doctors.next([]); doctors.complete();
    expect(store.loading()).toBe(false);
  });
  it('preserves clinics when the doctors request fails', () => {
    const store = setup(throwError(() => new Error('Unavailable')));
    store.loadCatalog();
    expect(store.clinics()).toEqual(clinics);
    expect(store.clinicsLoading()).toBe(false);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('catalogUnavailable');
  });
  it('stops waiting and offers retry when a request never responds', () => {
    vi.useFakeTimers();
    const store = setup(NEVER);
    store.loadCatalog();
    vi.advanceTimersByTime(90000);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('catalogUnavailable');
    expect(store.clinics()).toEqual(clinics);
  });
});
