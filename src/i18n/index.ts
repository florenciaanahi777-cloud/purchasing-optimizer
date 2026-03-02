import en from './en'
import es from './es'

export type Locale = 'en' | 'es'
export type Dict = { [K in keyof typeof en]: string }

const dicts: Record<Locale, Dict> = { en, es }

export function getDict(locale: Locale): Dict {
  return dicts[locale]
}
