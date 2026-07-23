/** Matches backend enums and DTOs for Bookings */

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'NoShow' | 'CheckedIn'

export type BookingPurposeType = 'ResearchProject' | 'CoursePractice' | 'SelfStudy' | 'Other'

export type ResourceType = 'LabRoom' | 'Equipment'

export interface BookingResponse {
  bookingId: number
  userId: number
  priorityRuleId?: number
  priorityLevel?: number
  purposeType: string
  startTime: string
  endTime: string
  status: string
  rejectionReason?: string
  createdAt: string
}

export interface BookingItemResponse {
  bookingItemId: number
  resourceType: string
  labId?: number
  labName?: string
  equipmentId?: number
  equipmentName?: string
  note?: string
}

export interface BookingDetailResponse {
  bookingId: number
  userId: number
  userName?: string
  priorityRuleId?: number
  priorityLevel?: number
  approvedById?: number
  approvedByName?: string
  purposeType: string
  purposeDescription: string
  startTime: string
  endTime: string
  status: string
  rejectionReason?: string
  approvedAt?: string
  checkedInAt?: string
  checkedOutAt?: string
  createdAt: string
  items: BookingItemResponse[]
}

export interface BookingItemRequest {
  resourceType: ResourceType
  labId?: number
  equipmentId?: number
  note?: string
}

export interface CreateBookingRequest {
  purposeType: BookingPurposeType
  purposeDescription: string
  startTime: string
  endTime: string
  items: BookingItemRequest[]
}

export interface UpdateBookingRequest {
  purposeType: BookingPurposeType
  purposeDescription: string
  startTime: string
  endTime: string
  items: BookingItemRequest[]
}

export interface RejectBookingRequest {
  reason: string
}

export interface CalendarEventResponse {
  bookingId: number
  title: string
  start: string
  end: string
  status: string
}
