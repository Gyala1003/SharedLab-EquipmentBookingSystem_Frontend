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
    Available: { vi: 'Có thể sử dụng', en: 'Available' },
    Unavailable: { vi: 'Tạm không khả dụng', en: 'Unavailable' },
    Maintenance: { vi: 'Đang bảo trì', en: 'Under Maintenance' },
    Inactive: { vi: 'Ngừng hoạt động', en: 'Inactive' },
  },
  equipment: {
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
    ResearchProject: { vi: 'Dự án nghiên cứu', en: 'Research Project' },
    CoursePractice: { vi: 'Thực hành môn học', en: 'Course Practice' },
    SelfStudy: { vi: 'Tự học', en: 'Self-study' },
    Other: { vi: 'Khác', en: 'Other' },
  },
  resource: {
    LabRoom: { vi: 'Phòng lab', en: 'Lab Room' },
    Equipment: { vi: 'Thiết bị', en: 'Equipment' },
  },
  recurrence: {
    None: { vi: 'Không lặp', en: 'None' },
    Daily: { vi: 'Hằng ngày', en: 'Daily' },
    Weekly: { vi: 'Hằng tuần', en: 'Weekly' },
    Monthly: { vi: 'Hằng tháng', en: 'Monthly' },
  },
  violationType: {
    NoShow: { vi: 'Không đến', en: 'No-show' },
    LateCheckout: { vi: 'Trả muộn', en: 'Late Check-out' },
    DamageEquipment: { vi: 'Làm hỏng thiết bị', en: 'Damaged Equipment' },
    MisuseEquipment: { vi: 'Sử dụng sai', en: 'Equipment Misuse' },
    UnauthorizedUse: { vi: 'Sử dụng trái phép', en: 'Unauthorized Use' },
  },
  incidentType: {
    None: { vi: 'Không có', en: 'None' },
    DamageReported: { vi: 'Báo hư hỏng', en: 'Damage Reported' },
    LateCheckout: { vi: 'Trả muộn', en: 'Late Check-out' },
    MissingEquipment: { vi: 'Thiếu thiết bị', en: 'Missing Equipment' },
    Other: { vi: 'Khác', en: 'Other' },
  },
  notification: {
    BookingApproved: { vi: 'Booking được duyệt', en: 'Booking Approved' },
    BookingRejected: { vi: 'Booking bị từ chối', en: 'Booking Rejected' },
    BookingReminder: { vi: 'Nhắc lịch booking', en: 'Booking Reminder' },
    WaitlistAvailable: { vi: 'Có chỗ từ hàng chờ', en: 'Waitlist Spot Available' },
    Maintenance: { vi: 'Bảo trì', en: 'Maintenance' },
    Violation: { vi: 'Vi phạm', en: 'Violation' },
    System: { vi: 'Hệ thống', en: 'System' },
  },
}

export function labelOf(domain: string, value: ApiEnum | null | undefined, lang: 'vi' | 'en' = 'vi'): string {
  if (value === null || value === undefined || value === '') return '—'
  const key = String(value)
  const entry = maps[domain]?.[key]
  if (!entry) return key
  return entry[lang] ?? entry.vi ?? key
}

export function toneOf(domain: string, value: ApiEnum | null | undefined): string {
  const key = String(value ?? '')
  const tones: Record<string, Record<string, string>> = {
    user: { '1': 'emerald', '2': 'rose', '3': 'amber', '4': 'rose', Active: 'emerald', Inactive: 'rose', Restricted: 'amber', Locked: 'rose' },
    department: { '1': 'emerald', '2': 'rose', Active: 'emerald', Inactive: 'rose' },
    booking: { Pending: 'amber', Approved: 'emerald', Rejected: 'rose', Cancelled: 'rose', Completed: 'emerald', NoShow: 'rose' },
    lab: { Available: 'emerald', Unavailable: 'rose', Maintenance: 'indigo', Inactive: 'rose' },
    equipment: { Available: 'emerald', InUse: 'indigo', Maintenance: 'indigo', Broken: 'rose', Retired: 'rose' },
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
