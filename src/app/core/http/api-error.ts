/** Normalized API error the UI/stores rely on — never a raw HttpErrorResponse. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    readonly fieldErrors?: Record<string, string[]>,
    /**
     * The raw BE response body object (if any).
     * Use this to access custom fields the BE includes in error payloads
     * (e.g. suggestedSlots, conflictDetails) that don't fit the standard schema.
     */
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
