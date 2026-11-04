import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CareStore } from './care.store';
import { CareService } from '../infrastructure/care/care.service';
import { CareAlert } from '../domain/model/alert.entity';
import { Patient } from '../domain/model/patient.entity';
import { CareSnapshot } from '../domain/model/care.snapshot';
import { AuthenticationStore } from '../../iam/application/authentication.store';
import { UserStore } from '../../iam/application/user.store';
import { Session } from '../../iam/domain/model/session.entity';
import { User } from '../../iam/domain/model/user.entity';
import { Role } from '../../iam/domain/model/role.entity';

describe('Care backend coordination', () => {
  const session = signal(new Session('DR-02', new Role('doctor')));
  const doctor = new User('DR-02', 'Luis Ramos', 'luis@vitalink.demo', new Role('doctor'));
  const alert = new CareAlert('A-002', 'P-002', 'HIGH', 'PENDING', 'help', '2026-11-01T12:00:00Z', null, 2);
  const snapshot = (): CareSnapshot => ({
    patients: [new Patient('P-001', 'Elena', 'Pérez', 72, 'Lima', 'DR-01', ['FC-01'], null, true), new Patient('P-002', 'Carlos', 'Pérez', 68, 'Lima', 'DR-02', ['FC-02'], null, true)],
    alerts: [alert], records: [], interventions: [], caregivers: [], measurementRanges: [],
  });
  let service: { load: ReturnType<typeof vi.fn>; updateAlert: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    session.set(new Session('DR-02', new Role('doctor')));
    service = { load: vi.fn(() => of(snapshot())), updateAlert: vi.fn(() => of(alert)) };
    TestBed.configureTestingModule({ providers: [
      { provide: CareService, useValue: service },
      { provide: AuthenticationStore, useValue: { session, role: computed(() => session().role.code) } },
      { provide: UserStore, useValue: { user: signal(doctor) } },
    ] });
  });

  it('selects patients by the signed-in user instead of fixed environment IDs', () => {
    const store = TestBed.inject(CareStore);
    store.load();
    expect(store.professionalPatients().map(patient => patient.id)).toEqual(['P-002']);
    session.set(new Session('FC-02', new Role('family')));
    store.load();
    expect(store.familyPatients().map(patient => patient.id)).toEqual(['P-002']);
  });

  it('reloads the intervention authored by the backend after the atomic update', () => {
    const store = TestBed.inject(CareStore);
    store.load();
    const updated = snapshot();
    updated.interventions = [{ id: 'I-SERVER', alertId: alert.id, actor: doctor.name, actorId: doctor.id, role: 'professional', from: 'PENDING', to: 'ATTENDED', at: '2026-11-01T13:00:00Z', note: 'Realizado' }];
    service.load.mockReturnValue(of(updated));
    store.changeStatus(alert, 'ATTENDED', ' Realizado ');
    expect(service.updateAlert).toHaveBeenCalledWith('A-002', 'ATTENDED', 'Realizado', 2);
    expect(store.data().interventions[0].id).toBe('I-SERVER');
    expect(store.message()).toBe('saved');
  });

  it('reports backend version conflicts and does not announce success', () => {
    const store = TestBed.inject(CareStore);
    store.load();
    service.updateAlert.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    store.changeStatus(alert, 'ATTENDED', 'Realizado');
    expect(store.error()).toBe('conflict');
    expect(store.message()).toBe('');
    expect(service.load).toHaveBeenCalledTimes(2);
  });
});
