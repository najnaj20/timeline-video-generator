import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { detectLang, makeT, LOCALES } from './i18n'

const LANG_KEY = 'tlvg-lang'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY)
      if (saved === 'id' || saved === 'en') return saved
    } catch {
      /* localStorage tidak tersedia */
    }
    return detectLang()
  })

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      /* abaikan */
    }
    document.documentElement.lang = lang === 'id' ? 'id' : 'en'
  }, [lang])

  const t = useMemo(() => makeT(lang), [lang])
  const locale = LOCALES.find((l) => l.id === lang)?.intl || 'id-ID'

  return (
    <LangContext.Provider value={{ lang, setLang, t, locale }}>{children}</LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang harus dipakai di dalam <LangProvider>')
  return ctx
}