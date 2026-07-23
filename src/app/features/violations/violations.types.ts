/** Matches backend ViolationResponse and related DTOs */

export interface Violation {
  violationId: number
  userId: number
  userName: string
  bookingId: number | null
  policyId: number
  policyTitle: string
  description: string
  violationCount: number
  actionTaken: string | null
  createdAt: string
}

export interface CreateViolationInput {
  userId: number
  bookingId?: number
  policyId: number
  description: string
}
