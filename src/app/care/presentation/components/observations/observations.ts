import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { OBSERVATIONS_PORT } from '../../../application/observations.port';
import { Observation } from '../../../domain/model/observation.entity';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocalizedDateService } from '../../../../shared/i18n/localized-date.service';
import { CareStore } from '../../../application/care.store';
@Component({
 selector: 'app-observations', imports: [FormsModule, RouterLink],
 template: `
 <article class="panel">
  @if (!doctor()) {
   @if (latestObservation(); as latest) {
    <section class="attention-status" [class.completed]="!!latest.attendedAt" role="status" aria-label="Estado de la revisión profesional">
     @if (latest.attendedAt) {
      <strong>Atendido por el profesional {{ latest.doctorName }}</strong>
      <small>Atención completada el {{ dates.dateTime(latest.attendedAt) }} (hora de Lima)</small>
     } @else {
      <strong>Revisión pendiente de finalizar</strong>
      <small>{{ latest.doctorName }} envió observaciones y aún no ha marcado esta revisión como atendida.</small>
     }
    </section>
   }
  }
  <h2>Observaciones del doctor</h2>
  @if (doctor()) {
   <label for="doctor-observation">Escribe una observación para el paciente</label>
   <textarea id="doctor-observation" [(ngModel)]="text" maxlength="2000" rows="5" [disabled]="busy()" placeholder="Indicaciones y seguimiento del paciente"></textarea>
   <small>{{ text.length }}/2000</small>
   <button type="button" (click)="send()" [disabled]="busy() || !text.trim() || loading()">Enviar observación</button>
  }
  @if (error()) { <p role="alert">{{ error() }}</p> }
  @if (message()) { <p role="status">{{ message() }}</p> }
  @if (loading()) { <p>Cargando observaciones…</p> }
  @for (o of observations(); track o.id; let first = $first) {
   <section class="observation">
    <strong>{{ o.doctorName }}</strong>
    <small>{{ dates.dateTime(o.createdAt) }}</small>
    <p class="text">{{ o.text }}</p>
    @if (o.attendedAt) { <p class="completed-review">Atendido por el profesional {{ o.doctorName }} · {{ dates.dateTime(o.attendedAt) }}</p> }
    @else if (doctor() && first) {
     <button type="button" (click)="attend(o)" [disabled]="busy() || !!text.trim()">Marcar paciente como atendido</button>
    }
   </section>
  } @empty { @if (!loading()) { <p>Aún no hay observaciones médicas.</p> } }
  @if (doctor()) { <a routerLink="/doctor/dashboard">Continuar con pacientes pendientes →</a> }
 </article>`,
 styles: [`
 :host{display:block;margin:20px 0}.panel{background:white;border:1px solid #dbe4e8;border-radius:16px;padding:24px}
 .attention-status{padding:16px;border:1px solid #dfc58d;border-radius:12px;background:#fff8e8;margin-bottom:20px}.attention-status.completed{background:#e5f5ef;border-color:#93cbb5}.attention-status strong{display:block;color:#174b56}.attention-status small{margin-top:8px}.completed-review{color:#17624a;font-weight:600}
 textarea{display:block;box-sizing:border-box;width:100%;font:inherit;padding:12px;margin:10px 0;border:1px solid #859da5;border-radius:8px;resize:vertical}
 button{display:inline-block;margin:12px 12px 12px 0;padding:12px 18px;border:0;border-radius:8px;background:#086f78;color:white;cursor:pointer}
 button:disabled{opacity:.5;cursor:default}.observation{border-top:1px solid #e0e7eb;padding:16px 0}
 small{display:block;color:#52636b}.text{white-space:pre-wrap;overflow-wrap:anywhere}a{display:block;margin-top:12px}
 `]
})
export class Observations {
 readonly patientId=input.required<string>(); readonly doctor=input(false);
 private readonly service=inject(OBSERVATIONS_PORT); readonly dates=inject(LocalizedDateService);
 private readonly store=inject(CareStore);
 readonly observations=signal<Observation[]>([]); readonly busy=signal(false); readonly loading=signal(false);
 readonly latestObservation=computed(()=>this.observations()[0]);
 readonly error=signal(''); readonly message=signal(''); text='';
 private generation=0;
 constructor() {
  effect(onCleanup=>{
   const id=this.patientId(); const generation=++this.generation;
   this.observations.set([]); this.text=''; this.message.set(''); this.error.set(''); this.loading.set(true);
   const refresh=()=> {
    const sub=this.service.observationsFor(id).subscribe({
     next:rows=>{if(generation===this.generation){this.observations.set(rows);this.loading.set(false);}},
     error:()=>{if(generation===this.generation){this.error.set('No se pudieron cargar las observaciones.');this.loading.set(false);}}
    }); return sub;
   };
   const initial=refresh(); const timer=setInterval(()=>refresh(),15000);
   onCleanup(()=>{initial.unsubscribe();clearInterval(timer);this.generation++;});
  });
 }
 send() {
  if(this.busy() || !this.text.trim()) return;
  const generation=this.generation; this.busy.set(true);this.error.set('');this.message.set('');
  this.service.sendObservation(this.patientId(),this.text.trim()).subscribe({
   next:o=>{this.busy.set(false);if(generation!==this.generation)return;this.observations.update(rows=>[o,...rows]);this.text='';this.message.set('Observación enviada. Se creó la notificación; el correo queda en cola.');},
   error:()=>{this.busy.set(false);if(generation===this.generation)this.error.set('No se pudo enviar la observación. Intenta nuevamente.');}
  });
 }
 attend(o:Observation) {
  if(this.busy()) return; const generation=this.generation;this.busy.set(true);this.error.set('');
  this.service.attendPatient(this.patientId(),o.id).subscribe({
   next:updated=>{this.busy.set(false);if(generation!==this.generation)return;this.observations.update(rows=>rows.map(r=>r.id===o.id?updated:r));this.store.load();this.message.set('Paciente atendido. Puedes continuar con los pendientes.');},
   error:()=>{this.busy.set(false);if(generation===this.generation)this.error.set('No se pudo cerrar la revisión. Actualiza las observaciones y comprueba si hay nuevas alertas.');}
  });
 }
}
