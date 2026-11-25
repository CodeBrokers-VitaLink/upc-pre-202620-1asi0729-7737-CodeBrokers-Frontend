import { Component, computed, effect, inject, signal } from '@angular/core';
import { OBSERVATIONS_PORT } from '../../../application/observations.port';
import { ObservationNotification } from '../../../domain/model/observation-notification.entity';
import { Router } from '@angular/router';
import { AuthenticationStore } from '../../../../iam/application/authentication.store';
import { LocalizedDateService } from '../../../../shared/i18n/localized-date.service';
@Component({
 selector:'app-notifications',
 template:`
 <button type="button" (click)="toggle()" [attr.aria-expanded]="open()" aria-label="Notificaciones de observaciones médicas">🔔 <span>{{ unread() }}</span></button>
 @if(open()){
  <section class="notices" aria-label="Notificaciones">
   <h2>Notificaciones</h2>
   @if(error()){<p role="alert">{{ error() }}</p><button type="button" (click)="refresh()">Reintentar</button>}
   @for(n of notices();track n.id){
    <button type="button" class="notice" [class.unread]="!n.readAt" (click)="read(n)">
     El doctor {{ n.doctorName }} registró una observación.
     <small>{{ dates.dateTime(n.createdAt) }} · {{ n.readAt ? 'Leída' : 'Sin leer' }}</small>
    </button>
   } @empty { <p>No hay notificaciones.</p> }
  </section>
 }`,
 styles:[`
 :host{position:relative}button{font:inherit;cursor:pointer;border:1px solid #cbd9df;border-radius:8px;padding:10px;background:white;color:#174b56}
 .notices{position:absolute;right:0;top:48px;width:min(360px,85vw);max-height:65vh;overflow:auto;background:white;box-shadow:0 10px 30px #1234;border:1px solid #dae4e8;border-radius:12px;padding:16px;z-index:50}
 h2{font-size:18px}.notice{display:block;width:100%;text-align:left;margin:8px 0}.unread{background:#e5f5f3;font-weight:600}small{display:block;margin-top:6px;font-weight:400}
 `]
})
export class Notifications {
 private readonly auth=inject(AuthenticationStore);private readonly service=inject(OBSERVATIONS_PORT);private readonly router=inject(Router);
 readonly dates=inject(LocalizedDateService);readonly notices=signal<ObservationNotification[]>([]);readonly open=signal(false);readonly error=signal('');
 readonly unread=computed(()=>this.notices().filter(n=>!n.readAt).length);
 constructor(){effect(onCleanup=>{
  const account=this.auth.session()?.userId;this.notices.set([]);this.open.set(false);
  if(!account)return;
  this.refresh();const timer=setInterval(()=>this.refresh(),15000);onCleanup(()=>clearInterval(timer));
 });}
 toggle(){this.open.update(v=>!v);if(this.open())this.refresh();}
 refresh(){
  const account=this.auth.session()?.userId;if(!account)return;
  this.service.notifications().subscribe({
   next:rows=>{if(this.auth.session()?.userId===account){this.notices.set(rows);this.error.set('');}},
   error:()=>{if(this.auth.session()?.userId===account)this.error.set('No se pudieron actualizar las notificaciones.');}
  });
 }
 read(n:ObservationNotification){
  const account=this.auth.session()?.userId;
  this.service.readNotification(n.id).subscribe({
   next:updated=>{
    if(account!==this.auth.session()?.userId)return;
    this.notices.update(rows=>rows.map(r=>r.id===n.id?updated:r));this.open.set(false);
    const role=this.auth.role()?.toLowerCase();
    void this.router.navigate(['/'+role+'/dashboard'],{queryParams:{patientId:n.patientId}});
   },
   error:()=>this.error.set('No se pudo marcar la notificación como leída.')
  });
 }
}
