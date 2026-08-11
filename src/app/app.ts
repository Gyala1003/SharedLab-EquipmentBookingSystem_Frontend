import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { ToastOutletComponent } from './shared/ui/toast-outlet'
import { ConfirmDialogOutletComponent } from './shared/ui/confirm-dialog'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastOutletComponent, ConfirmDialogOutletComponent],
  template: '<router-outlet /><app-toast-outlet /><app-confirm-dialog-outlet />',
})
export class App {}
