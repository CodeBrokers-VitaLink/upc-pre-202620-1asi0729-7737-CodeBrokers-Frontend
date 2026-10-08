import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';

/** Presentation component that switches the active UI language. */
@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonToggleGroup, MatButtonToggle, TranslatePipe],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LanguageSwitcher {
  private readonly translate = inject(TranslateService);
  readonly languages = ['en', 'es'];

  /** Keep every switcher synchronized with the shared TranslateService. */
  get currentLang(): string {
    return this.translate.currentLang() || 'es';
  }

  useLanguage(language: string): void {
    if (this.languages.includes(language)) this.translate.use(language);
  }
}
