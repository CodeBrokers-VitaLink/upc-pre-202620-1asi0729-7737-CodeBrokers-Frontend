import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CareService } from './care.service';
import { environment } from '../../../../environments/environment';

describe('Backend alert update', () => {
  it('sends note and version in the atomic PATCH and preserves the server version', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    let version = -1;
    TestBed.inject(CareService).updateAlert('A-001', 'ATTENDED', 'Seguimiento realizado', 3).subscribe(alert => version = alert.version);
    const request = http.expectOne(environment.apiUrl + '/alerts/A-001');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'ATTENDED', note: 'Seguimiento realizado', expectedVersion: 3 });
    request.flush({ id: 'A-001', patientId: 'P-001', type: 'help', severity: 'HIGH', status: 'ATTENDED', raisedAt: '2026-11-01T12:00:00Z', recordId: null, version: 4 });
    expect(version).toBe(4);
    http.expectNone(environment.apiUrl + '/interventions');
    http.verify();
  });
});
