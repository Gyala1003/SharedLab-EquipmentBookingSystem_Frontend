import { Injectable, computed, signal } from '@angular/core'

export interface SystemMaintenanceConfig {
  enabled: boolean
  title: string
  titleEn: string
  subtitle: string
  subtitleEn: string
  startTime: string
  endTime: string
  description: string
  descriptionEn: string
  createdAt: string
  createdBy: string
}

const STORAGE_KEY = 'sharedlab.system_maintenance_config'

function getDefaultConfig(): SystemMaintenanceConfig {
  const now = new Date()
  const end = new Date(now.getTime() + 4 * 3600 * 1000)
  return {
    enabled: false,
    title: 'Nâng cấp & Bảo trì hệ thống',
    titleEn: 'System Maintenance & Upgrade',
    subtitle: 'SharedLab Workspace đang thực hiện nâng cấp hạ tầng & bảo trì cơ sở dữ liệu định kỳ.',
    subtitleEn: 'SharedLab Workspace is undergoing scheduled infrastructure upgrades and database maintenance.',
    startTime: now.toISOString(),
    endTime: end.toISOString(),
    description: 'Mọi thao tác mượn phòng, mượn thiết bị và gửi yêu cầu tạm thời bị gián đoạn để đảm bảo an toàn dữ liệu hệ thống. Quý người dùng vui lòng quay lại sau khi khoảng thời gian bảo trì kết thúc.',
    descriptionEn: 'All room bookings, equipment requests, and management actions are temporarily suspended to ensure system data integrity. Please try again after the maintenance window ends.',
    createdAt: now.toISOString(),
    createdBy: 'System Admin',
  }
}

@Injectable({ providedIn: 'root' })
export class SystemMaintenanceStore {
  private readonly _config = signal<SystemMaintenanceConfig>(this.loadConfig())

  readonly config = this._config.asReadonly()

  readonly isEnabled = computed(() => this._config().enabled)

  readonly isMaintenanceActive = computed(() => {
    const cfg = this._config()
    if (!cfg.enabled) return false

    const now = new Date().getTime()
    const start = Date.parse(cfg.startTime)
    const end = Date.parse(cfg.endTime)

    if (Number.isNaN(start) || Number.isNaN(end)) return false
    return now >= start && now < end
  })

  private loadConfig(): SystemMaintenanceConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SystemMaintenanceConfig
        return { ...getDefaultConfig(), ...parsed }
      }
    } catch {
      // Fallback
    }
    return getDefaultConfig()
  }

  private saveConfig(config: SystemMaintenanceConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      // Ignore write errors
    }
  }

  updateConfig(partial: Partial<SystemMaintenanceConfig>): void {
    const updated: SystemMaintenanceConfig = {
      ...this._config(),
      ...partial,
    }
    this._config.set(updated)
    this.saveConfig(updated)
  }

  enableMaintenance(payload?: {
    title?: string
    titleEn?: string
    startTime?: string
    endTime?: string
    description?: string
    descriptionEn?: string
    createdBy?: string
  }): void {
    const now = new Date()
    const end = new Date(now.getTime() + 4 * 3600 * 1000)
    this.updateConfig({
      enabled: true,
      title: payload?.title || 'Nâng cấp & Bảo trì hệ thống',
      titleEn: payload?.titleEn || 'System Maintenance & Upgrade',
      startTime: payload?.startTime || now.toISOString(),
      endTime: payload?.endTime || end.toISOString(),
      description: payload?.description || 'Mọi thao tác mượn phòng, mượn thiết bị và gửi yêu cầu tạm thời bị gián đoạn. Quý người dùng vui lòng quay lại sau.',
      descriptionEn: payload?.descriptionEn || 'All room bookings, equipment requests, and management actions are temporarily suspended. Please try again after maintenance completes.',
      createdAt: now.toISOString(),
      createdBy: payload?.createdBy || 'System Admin',
    })
  }

  disableMaintenance(): void {
    this.updateConfig({ enabled: false })
  }

  toggleMaintenance(): boolean {
    const newState = !this._config().enabled
    this.updateConfig({ enabled: newState })
    return newState
  }
}
