import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '../domain/model/user.entity';
import { UserService } from '../infrastructure/user.service';
import { AuthenticationStore } from './authentication.store';
@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly service = inject(UserService);
  private readonly authentication = inject(AuthenticationStore);
  private readonly destroy = inject(DestroyRef);
  readonly user = signal<User | null>(null);
  readonly error = signal(false);
  load(): void {
    const id = this.authentication.session()?.userId;
    this.user.set(null); this.error.set(false);
    if (!id) return;
    this.service.findById(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: user => { if (this.authentication.session()?.userId === id) this.user.set(user); },
      error: () => this.error.set(true),
    });
  }
}
