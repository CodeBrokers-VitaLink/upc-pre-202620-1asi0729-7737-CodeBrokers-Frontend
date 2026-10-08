import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationStore } from '../../../application/authentication.store';
import { UserStore } from '../../../application/user.store';
@Component({
  imports: [TranslatePipe, MatButtonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  readonly store = inject(UserStore);
  private readonly authentication = inject(AuthenticationStore);
  private readonly router = inject(Router);
  signOut(): void { this.authentication.signOut(); this.store.user.set(null); void this.router.navigateByUrl('/'); }
  constructor() { this.store.load(); }
}
