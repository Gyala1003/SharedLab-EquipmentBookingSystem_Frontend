/** Matches backend LabRoomResponse / LabRoomDetailResponse */

export type LabRoomStatus = 'Available' | 'Unavailable' | 'Maintenance' | 'Inactive'

export interface LabRoom {
  labId: number
  labName: string
  roomCode: string
  location: string
  capacity: number
  status: string
}

export interface LabRoomDetail {
  labId: number
  labName: string
  roomCode: string
  location: string
  capacity: number
  description?: string
  imageUrl?: string
  usageGuideline?: string
  status: string
  managerName?: string
}

export interface CreateLabRoomInput {
  labName: string
  roomCode: string
  location: string
  capacity: number
  description?: string
  imageUrl?: string
  usageGuideline?: string
  managerId: number
}

export interface UpdateLabRoomInput {
  labName: string
  roomCode: string
  location: string
  capacity: number
  description?: string
  imageUrl?: string
  usageGuideline?: string
}

export interface ChangeLabRoomManagerInput {
  managerId: number
}

export interface LabRoomSearchParams {
  keyword?: string
  status?: LabRoomStatus
  pageNumber?: number
  pageSize?: number
}
