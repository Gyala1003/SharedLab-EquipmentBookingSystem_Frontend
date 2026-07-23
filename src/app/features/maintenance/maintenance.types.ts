/** Matches backend MaintenanceResponse and related DTOs */

export type MaintenanceStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled'

export interface MaintenanceSchedule {
  maintenanceId: number
  labId: number | null
  labName: string | null
  equipmentId: number | null
  equipmentName: string | null
  title: string
  description: string
  scheduledStart: string
  scheduledEnd: string
  actualEnd: string | null
  cost: number
  status: MaintenanceStatus
  createdAt: string
}

export interface CreateMaintenanceInput {
  labId?: number
  equipmentId?: number
  title: string
  description: string
  scheduledStart: string
  scheduledEnd: string
  cost?: number
}

export interface UpdateMaintenanceInput {
  title: string
  description: string
  scheduledStart: string
  scheduledEnd: string
  cost?: number
  status: MaintenanceStatus
  actualEnd?: string
}

export interface MaintenanceCostReport {
  totalCost: number
  items: MaintenanceSchedule[]
}
