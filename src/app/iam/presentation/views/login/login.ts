import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthenticationStore } from '../../../application/authentication.store';
@Component({
  imports: [FormsModule, MatButtonModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly authentication = inject(AuthenticationStore);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  readonly showPassword = signal(false);
  email = '';
  password = '';
  submit(form: NgForm): void {
    if (form.invalid || this.authentication.signingIn()) return;
    this.authentication.signIn(this.email, this.password).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: home => { this.password = ''; void this.router.navigateByUrl(home); },
      error: () => {},
    });
  }
}
