/** Matches backend EquipmentResponse / EquipmentDetailResponse */

export type EquipmentStatus = 'Available' | 'InUse' | 'Maintenance' | 'Broken' | 'Retired'

export interface Equipment {
  equipmentId: number
  labId: number
  equipmentName: string
  status: string
}

export interface EquipmentDetail {
  equipmentId: number
  labId: number
  equipmentName: string
  modelSpecs?: string
  imageUrl?: string
  usageGuideline?: string
  status: string
}

export interface CreateEquipmentInput {
  labId: number
  equipmentName: string
  modelSpecs?: string
  imageUrl?: string
  usageGuideline?: string
}

export interface UpdateEquipmentInput {
  labId: number
  equipmentName: string
  modelSpecs?: string
  imageUrl?: string
  usageGuideline?: string
}

export interface EquipmentSearchParams {
  keyword?: string
  labId?: number
  status?: EquipmentStatus
  pageNumber?: number
  pageSize?: number
}
