import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { ErrorStateService } from './error-state.service'

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private readonly injector: Injector) {}

  handleError(error: any): void {
    console.error('Unhandled Global Exception Captured:', error)

    const errorState = this.injector.get(ErrorStateService)
    const router = this.injector.get(Router)
    const zone = this.injector.get(NgZone)

    const rawMessage = error?.message || (typeof error === 'string' ? error : null)
    const message = rawMessage || 'Đã xảy ra lỗi không xác định trong quá trình thực thi ứng dụng.'

    if (!errorState.currentError()) {
      errorState.setError({
        status: 500,
        statusText: 'Lỗi ứng dụng',
        message: message,
        timestamp: new Date(),
      })
    }

    zone.run(() => {
      void router.navigate(['/error'])
    })
  }
}
