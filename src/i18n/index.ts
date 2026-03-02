import en from './en'
import es from './es'

export type Locale = 'en' | 'es'
export type Dict = typeof en

const dicts: Record<Locale, Dict> = { en, es }

export function getDict(locale: Locale): Dict {
  return dicts[locale]
}
