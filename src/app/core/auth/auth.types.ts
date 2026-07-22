/** Matches backend UserDTO from Application.DTOs.Auth */
export interface AuthUser {
  userId: number
  fullName: string
  username: string
  email: string
  roleName: string
  departmentName: string
  penaltyPoints: number
  restrictionUntil: string | null
  status: UserStatus
}

export type UserStatus = 'Active' | 'Inactive' | 'Restricted' | 'Locked'

export interface LoginPayload {
  email: string
  password: string
}

/** Backend returns only tokens — user info is fetched via GET /auth/me */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface CreateUserPayload {
  fullName: string
  username: string
  email: string
  password: string
  departmentId: number
  role: RoleName
}

export type RoleName = 'Admin' | 'LabManager' | 'Requester'

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}
