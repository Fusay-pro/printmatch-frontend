import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('printmatch-theme')
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    return 'system'
  })

  const [resolved, setResolved] = useState<'light' | 'dark'>(
    theme === 'system' ? getSystemTheme() : theme
  )

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === 'system' ? getSystemTheme() === 'dark' : theme === 'dark'
    setResolved(isDark ? 'dark' : 'light')
    root.classList.toggle('dark', isDark)
    localStorage.setItem('printmatch-theme', theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setResolved(e.matches ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
