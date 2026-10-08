import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Formats recorded dates using the active language and the care network timezone. */
@Injectable({ providedIn: 'root' })
export class LocalizedDateService {
  private readonly translate = inject(TranslateService);
  language(): string { return this.translate.currentLang()==='en'?'en-US':'es-PE'; }

  format(value: string | null | undefined): string {
    if (!value) return this.translate.instant('app.noRecords');
    return new Intl.DateTimeFormat(this.language(), {
      dateStyle: 'medium',
      timeZone: 'America/Lima',
    }).format(new Date(value));
  }
}
