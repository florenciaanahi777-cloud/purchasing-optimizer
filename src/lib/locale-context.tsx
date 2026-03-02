'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { getDict } from '@/i18n'
import type { Locale, Dict } from '@/i18n'

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
}>({ locale: 'en', setLocale: () => {} })

export function LocaleProvider({
  children,
  initial,
}: {
  children: React.ReactNode
  initial: Locale
}) {
  const [locale, setLocale] = useState<Locale>(initial)

  useEffect(() => { setLocale(initial) }, [initial])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}

export function useT(): Dict {
  const { locale } = useContext(LocaleContext)
  return getDict(locale)
}
