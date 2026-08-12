export function normalizeSearchText(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .normalize('NFC')
}

export function searchIncludes(needle: string, ...values: unknown[]): boolean {
  const normalizedNeedle = normalizeSearchText(needle)
  return (
    !normalizedNeedle ||
    values.some((value) => normalizeSearchText(value).includes(normalizedNeedle))
  )
}

/** Độ dài tối đa cho phép của từ khoá tìm kiếm (khớp với giới hạn backend). */
export const KEYWORD_MAX_LENGTH = 100

/**
 * Phát hiện chuỗi "rác": cùng một ký tự lặp liên tiếp hơn 20 lần.
 * Ví dụ: "aaaaaaaaaaaaaaaaaaaaaa", "3333333333333333333333" → true.
 */
export function isSpamKeyword(value: string): boolean {
  return /(.)\1{20,}/.test(value)
}

export interface KeywordValidationResult {
  valid: boolean
  trimmed: string
  reason?: string
}

/**
 * Validate từ khoá tìm kiếm:
 * - Trim khoảng trắng
 * - Kiểm tra độ dài tối đa (KEYWORD_MAX_LENGTH)
 * - Kiểm tra chuỗi lặp rõ ràng (spam)
 *
 * Trả về `{ valid: true, trimmed }` nếu hợp lệ,
 * hoặc `{ valid: false, trimmed, reason }` kèm lý do nếu không.
 */
export function validateKeyword(value: string): KeywordValidationResult {
  const trimmed = value.trim()
  if (trimmed.length > KEYWORD_MAX_LENGTH) {
    return {
      valid: false,
      trimmed,
      reason: `Từ khoá không được vượt quá ${KEYWORD_MAX_LENGTH} ký tự.`,
    }
  }
  if (trimmed.length > 0 && isSpamKeyword(trimmed)) {
    return {
      valid: false,
      trimmed,
      reason: 'Từ khoá không hợp lệ.',
    }
  }
  return { valid: true, trimmed }
}
