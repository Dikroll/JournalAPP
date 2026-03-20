import { useInitUser } from "@/features/initUser/hooks/useInitUser"
import { useEffect, useState } from "react"
import { AppRouter } from "./router"

export function App() {
  useInitUser()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    if (theme === 'light') document.documentElement.classList.add('light')
  }, [theme])

  return (
    <>
      <button
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        style={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 9999,
          padding: '8px 12px',
          borderRadius: 12,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          fontSize: 12,
          cursor: 'pointer'
        }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <AppRouter />
    </>
  )
}