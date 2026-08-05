import type { ApiEnum } from '../../core/api/system.models'

const maps: Record<string, Record<string, { vi: string; en: string }>> = {
  user: {
    '1': { vi: 'Đang hoạt động', en: 'Active' },
    '2': { vi: 'Ngừng hoạt động', en: 'Inactive' },
    '3': { vi: 'Bị hạn chế', en: 'Restricted' },
    '4': { vi: 'Bị khóa', en: 'Locked' },
    Active: { vi: 'Đang hoạt động', en: 'Active' },
    Inactive: { vi: 'Ngừng hoạt động', en: 'Inactive' },
    Restricted: { vi: 'Bị hạn chế', en: 'Restricted' },
    Locked: { vi: 'Bị khóa', en: 'Locked' },
  },
  department: {
    '1': { vi: 'Đang hoạt động', en: 'Active' },
    '2': { vi: 'Ngừng hoạt động', en: 'Inactive' },
    Active: { vi: 'Đang hoạt động', en: 'Active' },
    Inactive: { vi: 'Ngừng hoạt động', en: 'Inactive' },
    'Information Technology': { vi: 'Công nghệ thông tin', en: 'Information Technology' },
    'Computer Science': { vi: 'Khoa học máy tính', en: 'Computer Science' },
    'Electrical Engineering': { vi: 'Kỹ thuật điện', en: 'Electrical Engineering' },
    'Mechanical Engineering': { vi: 'Kỹ thuật cơ khí', en: 'Mechanical Engineering' },
    'Biotechnology': { vi: 'Công nghệ sinh học', en: 'Biotechnology' },
    'Physics': { vi: 'Vật lý', en: 'Physics' },
    'Chemistry': { vi: 'Hóa học', en: 'Chemistry' },
  },

  booking: {
    Pending: { vi: 'Chờ duyệt', en: 'Pending' },
    Approved: { vi: 'Đã duyệt', en: 'Approved' },
    Rejected: { vi: 'Bị từ chối', en: 'Rejected' },
    Cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
    Completed: { vi: 'Hoàn thành', en: 'Completed' },
    NoShow: { vi: 'Không đến', en: 'No-show' },
  },
  lab: {
    '1': { vi: 'Có thể sử dụng', en: 'Available' },
    '2': { vi: 'Đang bảo trì', en: 'Under Maintenance' },
    '3': { vi: 'Tạm không khả dụng', en: 'Unavailable' },
    '4': { vi: 'Ngừng hoạt động', en: 'Inactive' },
    Available: { vi: 'Có thể sử dụng', en: 'Available' },
    Unavailable: { vi: 'Tạm không khả dụng', en: 'Unavailable' },
    Maintenance: { vi: 'Đang bảo trì', en: 'Under Maintenance' },
    Inactive: { vi: 'Ngừng hoạt động', en: 'Inactive' },
  },
  equipment: {
    '1': { vi: 'Sẵn sàng', en: 'Available' },
    '2': { vi: 'Đang sử dụng', en: 'In Use' },
    '3': { vi: 'Đang bảo trì', en: 'Under Maintenance' },
    '4': { vi: 'Bị hỏng', en: 'Broken' },
    '5': { vi: 'Ngừng sử dụng', en: 'Retired' },
    Available: { vi: 'Sẵn sàng', en: 'Available' },
    InUse: { vi: 'Đang sử dụng', en: 'In Use' },
    Maintenance: { vi: 'Đang bảo trì', en: 'Under Maintenance' },
    Broken: { vi: 'Bị hỏng', en: 'Broken' },
    Retired: { vi: 'Ngừng sử dụng', en: 'Retired' },
  },
  maintenance: {
    Scheduled: { vi: 'Đã lên lịch', en: 'Scheduled' },
    InProgress: { vi: 'Đang thực hiện', en: 'In Progress' },
    Completed: { vi: 'Hoàn thành', en: 'Completed' },
    Cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
  },
  waitlist: {
    Waiting: { vi: 'Đang chờ', en: 'Waiting' },
    Notified: { vi: 'Đã thông báo', en: 'Notified' },
    Booked: { vi: 'Đã tạo booking', en: 'Booked' },
    Cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
    Expired: { vi: 'Hết hạn', en: 'Expired' },
  },
  violation: {
    Active: { vi: 'Đang hiệu lực', en: 'Active' },
    Resolved: { vi: 'Đã xử lý', en: 'Resolved' },
    Cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
  },
  incident: {
    NotRequired: { vi: 'Không cần duyệt', en: 'Not Required' },
    Pending: { vi: 'Chờ duyệt', en: 'Pending' },
    Confirmed: { vi: 'Đã xác nhận', en: 'Confirmed' },
    Rejected: { vi: 'Đã từ chối', en: 'Rejected' },
  },
  purpose: {
    '1': { vi: 'Dự án nghiên cứu', en: 'Research Project' },
    '2': { vi: 'Thực hành môn học', en: 'Course Practice' },
    '3': { vi: 'Tự học', en: 'Self-study' },
    '4': { vi: 'Khác', en: 'Other' },
    ResearchProject: { vi: 'Dự án nghiên cứu', en: 'Research Project' },
    CoursePractice: { vi: 'Thực hành môn học', en: 'Course Practice' },
    SelfStudy: { vi: 'Tự học', en: 'Self-study' },
    Other: { vi: 'Khác', en: 'Other' },
  },
  resource: {
    '1': { vi: 'Phòng lab', en: 'Lab Room' },
    '2': { vi: 'Thiết bị', en: 'Equipment' },
    LabRoom: { vi: 'Phòng lab', en: 'Lab Room' },
    Equipment: { vi: 'Thiết bị', en: 'Equipment' },
  },
  recurrence: {
    '0': { vi: 'Không lặp', en: 'None' },
    '1': { vi: 'Hằng ngày', en: 'Daily' },
    '2': { vi: 'Hằng tuần', en: 'Weekly' },
    '3': { vi: 'Hằng tháng', en: 'Monthly' },
    None: { vi: 'Không lặp', en: 'None' },
    Daily: { vi: 'Hằng ngày', en: 'Daily' },
    Weekly: { vi: 'Hằng tuần', en: 'Weekly' },
    Monthly: { vi: 'Hằng tháng', en: 'Monthly' },
  },
  violationType: {
    '1': { vi: 'Không đến', en: 'No-show' },
    '2': { vi: 'Trả muộn', en: 'Late Check-out' },
    '3': { vi: 'Làm hỏng thiết bị', en: 'Damaged Equipment' },
    '4': { vi: 'Sử dụng sai', en: 'Equipment Misuse' },
    '5': { vi: 'Sử dụng trái phép', en: 'Unauthorized Use' },
    NoShow: { vi: 'Không đến', en: 'No-show' },
    LateCheckout: { vi: 'Trả muộn', en: 'Late Check-out' },
    DamageEquipment: { vi: 'Làm hỏng thiết bị', en: 'Damaged Equipment' },
    MisuseEquipment: { vi: 'Sử dụng sai', en: 'Equipment Misuse' },
    UnauthorizedUse: { vi: 'Sử dụng trái phép', en: 'Unauthorized Use' },
  },
  incidentType: {
    '1': { vi: 'Không có', en: 'None' },
    '2': { vi: 'Báo hư hỏng', en: 'Damage Reported' },
    '3': { vi: 'Trả muộn', en: 'Late Check-out' },
    '4': { vi: 'Thiếu thiết bị', en: 'Missing Equipment' },
    '5': { vi: 'Khác', en: 'Other' },
    None: { vi: 'Không có', en: 'None' },
    DamageReported: { vi: 'Báo hư hỏng', en: 'Damage Reported' },
    LateCheckout: { vi: 'Trả muộn', en: 'Late Check-out' },
    MissingEquipment: { vi: 'Thiếu thiết bị', en: 'Missing Equipment' },
    Other: { vi: 'Khác', en: 'Other' },
  },
  notification: {
    '1': { vi: 'Booking được duyệt', en: 'Booking Approved' },
    '2': { vi: 'Booking bị từ chối', en: 'Booking Rejected' },
    '3': { vi: 'Nhắc lịch booking', en: 'Booking Reminder' },
    '4': { vi: 'Có chỗ từ hàng chờ', en: 'Waitlist Spot Available' },
    '5': { vi: 'Bảo trì', en: 'Maintenance' },
    '6': { vi: 'Vi phạm', en: 'Violation' },
    '7': { vi: 'Hệ thống', en: 'System' },
    BookingApproved: { vi: 'Booking được duyệt', en: 'Booking Approved' },
    BookingRejected: { vi: 'Booking bị từ chối', en: 'Booking Rejected' },
    BookingReminder: { vi: 'Nhắc lịch booking', en: 'Booking Reminder' },
    WaitlistAvailable: { vi: 'Có chỗ từ hàng chờ', en: 'Waitlist Spot Available' },
    Maintenance: { vi: 'Bảo trì', en: 'Maintenance' },
    Violation: { vi: 'Vi phạm', en: 'Violation' },
    System: { vi: 'Hệ thống', en: 'System' },
  },
}

export function labelOf(domain: string, value: ApiEnum | null | undefined, lang?: 'vi' | 'en'): string {
  if (value === null || value === undefined || value === '') return '—'
  const key = String(value)
  const entry = maps[domain]?.[key]
  if (!entry) return key
  const activeLang =
    lang ??
    (typeof localStorage !== 'undefined'
      ? ((localStorage.getItem('app.lang') || localStorage.getItem('app.locale')) as 'vi' | 'en')
      : null) ??
    (typeof document !== 'undefined' && document.documentElement?.lang === 'en' ? 'en' : 'vi')
  return entry[activeLang] ?? entry.en ?? entry.vi ?? key
}

export function toneOf(domain: string, value: ApiEnum | null | undefined): string {
  const key = String(value ?? '')
  const tones: Record<string, Record<string, string>> = {
    user: { '1': 'emerald', '2': 'rose', '3': 'amber', '4': 'rose', Active: 'emerald', Inactive: 'rose', Restricted: 'amber', Locked: 'rose' },
    department: { '1': 'emerald', '2': 'rose', Active: 'emerald', Inactive: 'rose' },
    booking: { Pending: 'amber', Approved: 'emerald', Rejected: 'rose', Cancelled: 'rose', Completed: 'emerald', NoShow: 'rose' },
    lab: { '1': 'emerald', '2': 'indigo', '3': 'rose', '4': 'rose', Available: 'emerald', Unavailable: 'rose', Maintenance: 'indigo', Inactive: 'rose' },
    equipment: { '1': 'emerald', '2': 'indigo', '3': 'indigo', '4': 'rose', '5': 'rose', Available: 'emerald', InUse: 'indigo', Maintenance: 'indigo', Broken: 'rose', Retired: 'rose' },
    maintenance: { Scheduled: 'amber', InProgress: 'indigo', Completed: 'emerald', Cancelled: 'rose' },
    waitlist: { Waiting: 'amber', Notified: 'indigo', Booked: 'emerald', Cancelled: 'rose', Expired: 'rose' },
    violation: { Active: 'rose', Resolved: 'emerald', Cancelled: 'slate' },
    incident: { NotRequired: 'slate', Pending: 'amber', Confirmed: 'rose', Rejected: 'slate' },
  }
  return tones[domain]?.[key] ?? 'slate'
}


export function toIso(localValue: string): string {
  return localValue ? new Date(localValue).toISOString() : ''
}

export function toDateInput(value: Date): string {
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toLocalDateTimeInput(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0)
}

export interface CheckInWindowInfo {
  canCheckIn: boolean
  isTooEarly: boolean
  isTooLate: boolean
  earliestTime: Date
  latestTime: Date
  reason: string
}

export function getCheckInWindowInfo(startTimeIso: string, endTimeIso: string): CheckInWindowInfo {
  const startTime = new Date(startTimeIso)
  const endTime = new Date(endTimeIso)
  const now = new Date()

  const earliestTime = new Date(startTime.getTime() - 15 * 60_000)
  const thirtyMinsAfterStart = new Date(startTime.getTime() + 30 * 60_000)
  const latestTime = thirtyMinsAfterStart < endTime ? thirtyMinsAfterStart : endTime

  const isTooEarly = now < earliestTime
  const isTooLate = now > latestTime
  const canCheckIn = !isTooEarly && !isTooLate

  let reason = ''
  if (isTooEarly) {
    reason = 'Chưa đến khung giờ điểm danh (Mở từ 15 phút trước giờ bắt đầu)'
  } else if (isTooLate) {
    reason = 'Đã quá hạn điểm danh (Chỉ cho phép điểm danh tối đa 30 phút sau giờ bắt đầu)'
  }

  return { canCheckIn, isTooEarly, isTooLate, earliestTime, latestTime, reason }
}
