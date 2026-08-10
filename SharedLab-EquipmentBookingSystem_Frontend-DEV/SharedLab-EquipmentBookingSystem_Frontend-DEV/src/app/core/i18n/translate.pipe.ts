import { Pipe, PipeTransform, inject } from '@angular/core'
import { LanguageStore, type SupportedLocale } from './language.store'
import { translations } from './translations'

// Build a fast O(1) normalized lookup map once
const normalizedTranslationMap = new Map<string, { vi?: string; en?: string }>()
for (const [k, v] of Object.entries(translations)) {
  const normKey = k.trim().normalize('NFC').toLowerCase()
  if (!normalizedTranslationMap.has(normKey)) {
    normalizedTranslationMap.set(normKey, v)
  }
}

// Memoization cache for instant translation retrieval
const translationCache = new Map<string, string>()

export function clearTranslationCache(): void {
  translationCache.clear()
}

export function findTranslation(key: string, lang: 'vi' | 'en'): string | null {
  if (!key) return null
  const cacheKey = `${lang}:${key}`
  const cached = translationCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const raw = key.trim()
  const matchExtra = raw.match(/\s*\(\+(\d+)\)$/)
  const suffix = matchExtra ? matchExtra[0] : ''
  const cleanKey = matchExtra ? raw.replace(/\s*\(\+(\d+)\)$/, '').trim() : raw

  const nfc = cleanKey.normalize('NFC')
  const nfcLower = nfc.toLowerCase()

  // 1. Direct lookup O(1)
  let entry: { vi?: string; en?: string } | undefined =
    (translations as Record<string, { vi?: string; en?: string }>)[cleanKey] ||
    (translations as Record<string, { vi?: string; en?: string }>)[nfc]
  if (!entry) {
    // 2. Fast normalized map lookup O(1)
    entry = normalizedTranslationMap.get(nfcLower)
    if (!entry) {
      const matchedKey = Object.keys(translations).find(
        (k) => k.trim().normalize('NFC').toLowerCase() === nfcLower,
      )
      if (matchedKey) {
        entry = (translations as Record<string, { vi?: string; en?: string }>)[matchedKey]
        if (entry) normalizedTranslationMap.set(nfcLower, entry)
      }
    }
  }

  let result: string | null = null

  if (entry) {
    const text = entry[lang] || entry.vi || cleanKey
    result = text + suffix
  } else if (lang === 'en') {
    if (nfcLower.includes('mạng') || nfcLower.includes('hạ tầng'))
      result = 'Network & Infrastructure Lab' + suffix
    else if (nfcLower.includes('điện tử') || nfcLower.includes('viễn thông'))
      result = 'Electronics & Telecom Lab' + suffix
    else if (nfcLower.includes('sinh học')) result = 'Biology Laboratory' + suffix
    else if (nfcLower.includes('hóa học')) result = 'Chemistry Laboratory' + suffix
    else if (nfcLower.includes('robot') || nfcLower.includes('tự động hóa'))
      result = 'Robotics & Automation Lab' + suffix
    else if (nfcLower.includes('ai') || nfcLower.includes('khoa học dữ liệu'))
      result = 'AI & Data Science Lab' + suffix
    else if (nfcLower.includes('iot') || nfcLower.includes('nhúng'))
      result = 'IoT & Embedded Systems Lab' + suffix
    else if (nfcLower.includes('vật lý') || nfcLower.includes('quang học'))
      result = 'Physics & Optics Lab' + suffix
    else if (nfcLower.includes('cơ khí') || nfcLower.includes('in 3d'))
      result = 'Mechanical & 3D Printing Lab' + suffix
    else if (nfcLower.includes('an toàn thông tin')) result = 'Information Security Lab' + suffix
  }

  if (result !== null) {
    translationCache.set(cacheKey, result)
  }

  return result
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

  transform(
    key: string | null | undefined,
    langOrParams?: SupportedLocale | Record<string, string | number>,
    params?: Record<string, string | number>,
  ): string {
    if (!key) return ''

    let lang: SupportedLocale = this.languageStore.lang()
    let actualParams: Record<string, string | number> | undefined = params

    if (typeof langOrParams === 'string') {
      lang = langOrParams as SupportedLocale
    } else if (typeof langOrParams === 'object' && langOrParams !== null) {
      actualParams = langOrParams
    }

    let result = findTranslation(key, lang)

    if (!result || result === key) {
      result = translateDynamicLocation(key, lang)
    }

    if (actualParams && result) {
      for (const [k, v] of Object.entries(actualParams)) {
        result = result.replace(new RegExp(`\\{+${k}\\}+`, 'g'), String(v))
      }
    }

    return result || key
  }
}
