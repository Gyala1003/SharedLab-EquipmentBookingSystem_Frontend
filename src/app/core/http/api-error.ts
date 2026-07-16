/** Normalized API error the UI/stores rely on — never a raw HttpErrorResponse. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromUnknown(status: number, body: unknown): ApiError {
    if (body && typeof body === 'object' && 'message' in body) {
      const b = body as { message: string; code?: string; details?: unknown }
      return new ApiError(status, b.message, b.code ?? 'UNKNOWN', b.details)
    }
    return new ApiError(status, 'Đã có lỗi xảy ra. Vui lòng thử lại.', 'UNKNOWN')
  }
}
