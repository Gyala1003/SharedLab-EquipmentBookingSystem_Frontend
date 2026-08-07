export type UserRole = 'Admin' | 'LabManager' | 'Requester'
export type UserStatus = 'Active' | 'Restricted' | 'Inactive' | 'Locked' | number

/**
 * Canonical role names matching BE contract exactly (case-sensitive).
 * Always reference these constants instead of hardcoded strings.
 */
export const ROLE = {
  Admin: 'Admin' as UserRole,
  LabManager: 'LabManager' as UserRole,
  Requester: 'Requester' as UserRole,
} as const

export interface AuthUser {
  userId: number
  fullName: string
  username: string
  email: string
  roleName: UserRole | string
  departmentName: string
  penaltyPoints: number
  restrictionUntil: string | null
  status: UserStatus
}

export interface LoginPayload {
  email?: string
  username?: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  // BE AuthResponseDTO chỉ trả accessToken + refreshToken.
  // Không có expiresIn hay user trong login/refresh response.
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  token: string
  newPassword: string
}
