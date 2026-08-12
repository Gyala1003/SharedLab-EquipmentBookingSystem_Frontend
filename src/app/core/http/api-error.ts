/** Normalized API error the UI/stores rely on — never a raw HttpErrorResponse. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function apiErrorMessage(
  error: unknown,
  fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.',
): string {
  if (error instanceof ApiError && error.message?.trim()) {
    return error.message.trim()
  }

  if (error && typeof error === 'object') {
    const errObj = error as Record<string, any>
    const innerErr = errObj['error']

    if (typeof innerErr === 'string' && innerErr.trim()) {
      return innerErr.trim()
    }
    if (innerErr && typeof innerErr === 'object') {
      if (typeof innerErr.message === 'string' && innerErr.message.trim()) {
        return innerErr.message.trim()
      }
      if (typeof innerErr.detail === 'string' && innerErr.detail.trim()) {
        return innerErr.detail.trim()
      }
      if (typeof innerErr.title === 'string' && innerErr.title.trim()) {
        return innerErr.title.trim()
      }
    }

    if (typeof errObj['message'] === 'string' && errObj['message'].trim()) {
      return errObj['message'].trim()
    }
    if (typeof errObj['detail'] === 'string' && errObj['detail'].trim()) {
      return errObj['detail'].trim()
    }
  }

  return fallback
}
