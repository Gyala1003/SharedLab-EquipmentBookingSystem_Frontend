/** Matches backend PolicyResponse and related DTOs */

export interface Policy {
  policyId: number
  labId: number | null
  labName: string | null
  title: string
  description: string
  maxViolations: number
  lockDurationDays: number
  isActive: boolean
  createdAt: string
}

export interface CreatePolicyInput {
  labId?: number
  title: string
  description: string
  maxViolations: number
  lockDurationDays: number
}

export interface UpdatePolicyInput {
  labId?: number
  title: string
  description: string
  maxViolations: number
  lockDurationDays: number
  isActive: boolean
}
