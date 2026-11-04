import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Register } from './register';
import { ENROLLMENT_PORT } from '../../../application/enrollment.port';

describe('Registration flow', () => {
  const port = {
    clinics: () => of([{ id: 'CL-01', name: 'Clínica Uno' }]),
    doctors: () => of([
      { id: 'DR-01', name: 'Clínico', specialty: 'General', practiceType: 'clinic' as const, clinicId: 'CL-01' },
      { id: 'DR-02', name: 'Independiente', specialty: 'General', practiceType: 'independent' as const, clinicId: null },
    ]),
    registerDoctor: vi.fn(() => of(undefined)), registerFamily: vi.fn(() => of(undefined)),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ imports: [Register], providers: [
      provideRouter([]), provideTranslateService(), { provide: ENROLLMENT_PORT, useValue: port },
    ] });
  });
  async function setup() {
    const fixture = TestBed.createComponent(Register); await fixture.whenStable();
    const view = fixture.componentInstance;
    const values: Record<string,string> = { 'register-name':'Familiar', 'register-email':'family@example.com', 'register-phone':'900000111', 'register-password':'Demo12345', 'register-confirmation':'Demo12345' };
    for(const [id,value] of Object.entries(values)) {
      const input=fixture.nativeElement.querySelector('#'+id) as HTMLInputElement;
      input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));
    }
    await fixture.whenStable();
    return { fixture, view, form: () => fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm) };
  }
  it('shows the clinic selector only when the employment button is enabled, and clears an old choice', async () => {
    const { fixture, view } = await setup(); fixture.nativeElement.querySelectorAll('.account-options button')[1].click(); await fixture.whenStable(); expect(view.mode).toBe('doctor');
    expect(fixture.nativeElement.querySelector('#doctor-clinic')).toBeNull();
    fixture.nativeElement.querySelector('[role=switch]').click(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#doctor-clinic')).not.toBeNull();
    view.doctor.clinicId = 'CL-01'; fixture.nativeElement.querySelector('[role=switch]').click(); await fixture.whenStable();
    expect(view.doctor.clinicId).toBeNull(); expect(fixture.nativeElement.querySelector('#doctor-clinic')).toBeNull();
  });
  it('keeps account details for step two and prevents saving until all measurements are entered', async () => {
    const { fixture, view, form } = await setup(); fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(); await fixture.whenStable(); expect(form().valid, JSON.stringify(form().value)).toBe(true); view.submit(form()); fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(); await fixture.whenStable();
    expect(view.step).toBe(1); expect(view.account.email).toBe('family@example.com');
    Object.assign(view.patient, { givenName: 'Carmen', familyName: 'Morales', age: 72, location: 'Lima', doctorId: 'DR-02', consent: true });
    Object.assign(view.patient.initialVitals, { heartRate: 75, oxygen: 97, glucose: 110, systolic: 120 });
    fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(); await fixture.whenStable(); view.submit(form()); expect(port.registerFamily).not.toHaveBeenCalled();
    view.patient.initialVitals.diastolic = 80; fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(); await fixture.whenStable(); view.submit(form()); fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(); await fixture.whenStable();
    expect(port.registerFamily).toHaveBeenCalledOnce(); expect(view.store.success()).toBe(true); expect(view.account.password).toBe('');
  });
  it('filters doctors by service and clinic and clears the previous doctor and consent', async () => {
    const { view } = await setup(); expect(view.availableDoctors.map(d => d.id)).toEqual(['DR-02']);
    view.patient.doctorId = 'DR-02'; view.patient.consent = true; view.changeService('clinic');
    expect(view.patient.doctorId).toBeNull(); expect(view.patient.consent).toBe(false); expect(view.availableDoctors).toEqual([]);
    view.changeClinic('CL-01'); expect(view.availableDoctors.map(d => d.id)).toEqual(['DR-01']);
  });
});
