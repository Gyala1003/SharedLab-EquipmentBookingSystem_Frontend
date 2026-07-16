export interface AuthUser {
  id: string
  fullName: string
  email: string
  roles: string[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
}
