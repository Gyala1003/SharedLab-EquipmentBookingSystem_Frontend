import { Pipe, PipeTransform, inject } from '@angular/core'
import { LanguageStore } from './language.store'
import { translations } from './translations'

export function findTranslation(key: string, lang: 'vi' | 'en'): string | null {
  if (!key) return null
  const raw = key.trim()

  // Extract optional (+N) suffix for aggregated items
  const matchExtra = raw.match(/\s*\(\+(\d+)\)$/)
  const suffix = matchExtra ? matchExtra[0] : ''
  const cleanKey = matchExtra ? raw.replace(/\s*\(\+(\d+)\)$/, '').trim() : raw

  const nfc = cleanKey.normalize('NFC')
  const nfd = cleanKey.normalize('NFD')

  // Direct lookup
  let entry = translations[cleanKey] || translations[nfc] || translations[nfd]
  if (entry) {
    const text = entry[lang] || entry.vi || cleanKey
    return text + suffix
  }

  // Case-insensitive & NFC-normalized dictionary search
  const nfcLower = nfc.toLowerCase()
  for (const dictKey of Object.keys(translations)) {
    const dictNfc = dictKey.trim().normalize('NFC').toLowerCase()
    if (dictNfc === nfcLower) {
      entry = translations[dictKey]
      const text = entry[lang] || entry.vi || cleanKey
      return text + suffix
    }
  }

  // Fallback for Lab room names containing keywords when lang === 'en'
  if (lang === 'en') {
    if (nfcLower.includes('mạng') || nfcLower.includes('hạ tầng')) return 'Network & Infrastructure Lab' + suffix
    if (nfcLower.includes('điện tử') || nfcLower.includes('viễn thông')) return 'Electronics & Telecom Lab' + suffix
    if (nfcLower.includes('sinh học')) return 'Biology Laboratory' + suffix
    if (nfcLower.includes('hóa học')) return 'Chemistry Laboratory' + suffix
    if (nfcLower.includes('robot') || nfcLower.includes('tự động hóa')) return 'Robotics & Automation Lab' + suffix
    if (nfcLower.includes('ai') || nfcLower.includes('khoa học dữ liệu')) return 'AI & Data Science Lab' + suffix
    if (nfcLower.includes('iot') || nfcLower.includes('nhúng')) return 'IoT & Embedded Systems Lab' + suffix
    if (nfcLower.includes('vật lý') || nfcLower.includes('quang học')) return 'Physics & Optics Lab' + suffix
    if (nfcLower.includes('cơ khí') || nfcLower.includes('in 3d')) return 'Mechanical & 3D Printing Lab' + suffix
    if (nfcLower.includes('an toàn thông tin')) return 'Information Security Lab' + suffix
  }

  return null
}

export function translateDynamicLocation(text: string, lang: 'vi' | 'en' = 'en'): string {
  if (!text) return text
  let res = text.normalize('NFC')

  if (lang === 'en') {
    res = res
      .replace(/(?:Tầng|Tang)\s*(\d+)/gi, (_, num) => {
        const n = parseInt(num, 10)
        const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'
        return `${n}${suffix} Floor`
      })
      .replace(/(?:Tòa|Toa|Nhà|Nha)\s*([A-Za-z0-9]+)/gi, 'Building $1')
  } else if (lang === 'vi') {
    res = res
      .replace(/(\d+)(?:st|nd|rd|th)\s*Floor/gi, 'Tầng $1')
      .replace(/Building\s*([A-Za-z0-9]+)/gi, 'Tòa $1')
  }

  return res
}

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly languageStore = inject(LanguageStore)

  transform(key: string | null | undefined, params?: Record<string, string | number>): string {
    if (!key) return ''
    const lang = this.languageStore.lang()

    let result = findTranslation(key, lang)

    if (!result || result === key) {
      result = translateDynamicLocation(key, lang)
    }

    if (params && result) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{+${k}\\}+`, 'g'), String(v))
      }
    }

    return result || key
  }
}
