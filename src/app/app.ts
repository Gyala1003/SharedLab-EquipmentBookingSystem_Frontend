import { Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { ToastOutletComponent } from './shared/ui/toast-outlet'
import { ConfirmDialogOutletComponent } from './shared/ui/confirm-dialog'
import { UiLiteralTranslationService } from './core/i18n/ui-literal-translation.service'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastOutletComponent, ConfirmDialogOutletComponent],
  template: '<router-outlet /><app-toast-outlet /><app-confirm-dialog-outlet />',
})
export class App {
  // Starts the global hard-coded UI literal bridge for pages that have not yet been migrated to ngx-translate keys.
  private readonly uiLiteralTranslation = inject(UiLiteralTranslationService)
}

