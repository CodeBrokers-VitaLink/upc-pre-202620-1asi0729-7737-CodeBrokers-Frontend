import { AuthenticationStore } from './iam/application/authentication.store';
import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcher } from './shared/presentation/components/language-switcher/language-switcher';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    TranslatePipe,
    LanguageSwitcher,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly router = inject(Router);
  private readonly authentication = inject(AuthenticationStore);
  get homeLink(): string {
    return this.authentication.session()?.role.home ?? '/';
  }
  signOut(): void { this.authentication.signOut(); }
  private readonly translate = inject(TranslateService);
  readonly menu = signal(false);
  constructor() {
    effect(() => {
      const language = this.translate.currentLang();
      if (language) {
        localStorage.setItem('vitalink-language', language);
        document.documentElement.lang = language;
      }
    });
  }
  get role() {
    return this.router.url.startsWith('/doctor')
      ? 'doctor'
      : this.router.url.startsWith('/family')
        ? 'family'
        : '';
  }
}
