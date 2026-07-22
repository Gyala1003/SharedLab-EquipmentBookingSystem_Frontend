/** Matches backend UserManagementResponse and related DTOs */

export type UserStatus = 'Active' | 'Inactive' | 'Restricted' | 'Locked'
export type RoleName = 'Admin' | 'LabManager' | 'Requester'

export interface User {
  userId: number
  fullName: string
  username: string
  email: string
  roleId: number
  roleName: string
  departmentId: number
  departmentName: string
  penaltyPoints: number
  restrictionUntil: string | null
  status: UserStatus
}

export interface PagedUserResponse {
  items: User[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface UpdateUserInput {
  fullName: string
  username: string
  email: string
}

export interface ChangeUserRoleInput {
  roleName: RoleName
}

export interface ChangeUserDepartmentInput {
  departmentId: number
}

export interface SetUserStatusInput {
  status: UserStatus
}

export interface UserPenaltyResponse {
  userId: number
  penaltyPoints: number
  restrictionUntil: string | null
}

export interface UserSearchParams {
  keyword?: string
  roleName?: RoleName
  departmentId?: number
  status?: UserStatus
  pageNumber?: number
  pageSize?: number
}
