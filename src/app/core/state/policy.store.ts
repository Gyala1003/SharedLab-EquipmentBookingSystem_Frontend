import { Injectable, signal } from '@angular/core'

export interface Policy {
  policyId: number
  title: string
  content: string
  category: 'LabRoom' | 'Equipment' | 'General'
  updatedAt: string
}

const INITIAL_POLICIES: Policy[] = [
  {
    policyId: 1,
    title: 'Quy định Check-in & Check-out phòng lab',
    content:
      'Người dùng cần thực hiện Check-in đúng giờ đặt lịch. Trả phòng muộn quá 15 phút không báo trước sẽ bị ghi nhận vi phạm "Trả muộn" (+2 điểm phạt).',
    category: 'LabRoom',
    updatedAt: new Date().toISOString(),
  },
  {
    policyId: 2,
    title: 'Hướng dẫn bảo quản & vận hành thiết bị',
    content:
      'Tất cả thiết bị dùng chung phải được kiểm tra tình trạng ban đầu trước khi bật máy. Nghiêm cấm tự ý tháo lắp, thay đổi cấu hình thiết bị khi chưa có sự đồng ý của Quản lý phòng lab.',
    category: 'Equipment',
    updatedAt: new Date().toISOString(),
  },
  {
    policyId: 3,
    title: 'Xử lý sự cố và báo hỏng tài nguyên',
    content:
      'Khi xảy ra sự cố hỏng hóc hoặc bất thường về điện/thiết bị, lập tức ngắt nguồn điện thiết bị, báo cáo Quản lý phòng lab trên hệ thống hoặc trực tiếp qua số hotline sự cố.',
    category: 'General',
    updatedAt: new Date().toISOString(),
  },
  {
    policyId: 4,
    title: 'Quy định hủy booking & Không đến (No-Show)',
    content:
      'Hủy booking trước 2 giờ sẽ không bị trừ điểm. Đặt phòng nhưng không đến sử dụng mà không hủy lịch sẽ bị tính vi phạm "Không đến" (+3 điểm phạt) và hạn chế quyền đặt lịch.',
    category: 'LabRoom',
    updatedAt: new Date().toISOString(),
  },
  {
    policyId: 5,
    title: 'An toàn phòng thí nghiệm & Vệ sinh chung',
    content:
      'Tất cả thành viên phải mặc áo blouse, mang kính bảo hộ khi thực hành hóa chất/thiết bị điện áp cao. Dọn dẹp sạch khu vực làm việc trước khi bàn giao check-out.',
    category: 'General',
    updatedAt: new Date().toISOString(),
  },
]

@Injectable({ providedIn: 'root' })
export class PolicyStoreService {
  private readonly _policies = signal<Policy[]>(INITIAL_POLICIES)
  readonly policies = this._policies.asReadonly()

  list(): Policy[] {
    return this._policies()
  }

  create(policy: Omit<Policy, 'policyId' | 'updatedAt'>): void {
    const nextId = Math.max(0, ...this._policies().map((p) => p.policyId)) + 1
    const newPolicy: Policy = {
      ...policy,
      policyId: nextId,
      updatedAt: new Date().toISOString(),
    }
    this._policies.update((items) => [newPolicy, ...items])
  }

  update(id: number, changes: Partial<Omit<Policy, 'policyId'>>): void {
    this._policies.update((items) =>
      items.map((p) =>
        p.policyId === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p,
      ),
    )
  }

  remove(id: number): void {
    this._policies.update((items) => items.filter((p) => p.policyId !== id))
  }
}
