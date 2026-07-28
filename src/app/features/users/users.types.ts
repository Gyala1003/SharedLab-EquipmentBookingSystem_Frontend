export interface User {
  id: string
  fullName: string
  email: string
  role: string
  departmentId?: string
  isActive: boolean
}

export type UpsertUserInput = Omit<User, 'id' | 'isActive'> & { id?: string }
