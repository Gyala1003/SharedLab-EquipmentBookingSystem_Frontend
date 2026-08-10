import { Injectable, signal } from '@angular/core'

export interface AppErrorDetails {
  status?: number
  statusText?: string
  message: string
  url?: string
  timestamp: Date
  details?: Record<string, string[]> | any
}

@Injectable({ providedIn: 'root' })
export class ErrorStateService {
  private readonly _currentError = signal<AppErrorDetails | null>(null)
  readonly currentError = this._currentError.asReadonly()

  setError(error: AppErrorDetails): void {
    this._currentError.set(error)
  }

  clearError(): void {
    this._currentError.set(null)
  }
}
