import { memo } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/widgets/Sidebar'
import './WebLayout.css'

/**
 * WebLayout — лейаут для десктопа (ширина >= 768px).
 * 
 * Структура:
 *   ┌──────────┬────────────────────────┐
 *   │          │  TopBar                │
 *   │ Sidebar  ├────────────────────────┤
 *   │          │  <Outlet /> (страница) │
 *   └──────────┴────────────────────────┘
 * 
 * Страницы рендерятся через <Outlet /> — те же что и на мобиле,
 * никаких изменений в pages/* не нужно.
 */
export const WebLayout = memo(() => {
  return (
    <div className="web-layout">
      <Sidebar />
      <div className="web-layout__main">
        <main className="web-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
})

WebLayout.displayName = 'WebLayout'