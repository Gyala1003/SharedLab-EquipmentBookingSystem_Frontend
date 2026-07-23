/** Matches backend IncidentResponse and related DTOs */

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type IncidentStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed'

export interface Incident {
  incidentId: number
  bookingId: number | null
  equipmentId: number
  equipmentName: string
  labId: number
  labName: string
  reportedByUserId: number
  reportedByName: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  resolution: string | null
  reportedAt: string
  resolvedAt: string | null
}

export interface CreateIncidentInput {
  bookingId?: number
  equipmentId: number
  description: string
  severity: IncidentSeverity
}

export interface UpdateIncidentInput {
  status: IncidentStatus
  resolution?: string
}
