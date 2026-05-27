import { memo, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/widgets/Sidebar'
import { useMidnightRefresh } from '@/app/hooks/useMidnightRefresh'
import { GlowBackground, OfflineBanner } from '@/shared/ui'
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
  const [zoom, setZoom] = useState(1)
  useMidnightRefresh()

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width > 1920) {
        // Увеличиваем масштаб интерфейса пропорционально ширине экрана,
        // чтобы на ультрашироких 2K/4K экранах интерфейс не казался мелким.
        setZoom(width / 1920)
      } else {
        setZoom(1)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="web-layout-wrapper relative">
      <GlowBackground useVariables />
      <div 
        className="web-layout w-full relative z-10"
        style={{ 
          transform: `scale(${zoom})`, 
          transformOrigin: 'top left',
          width: `${100 / zoom}%`,
          height: `${100 / zoom}%`
        }}
      >
        <div className="web-layout__sidebar-wrapper">
          <div className="web-layout__sidebar-inner">
            <Sidebar />
          </div>
        </div>
        <div className="web-layout__main-wrapper">
          <div className="web-layout__offline-wrapper" style={{ zIndex: 100 }}>
            <OfflineBanner />
          </div>
          <main className="web-layout__content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
})

WebLayout.displayName = 'WebLayout'