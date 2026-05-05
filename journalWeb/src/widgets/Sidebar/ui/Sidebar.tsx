import { memo } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  BookOpen,
  Library,
  Star,
  User,
  Bell,
  CreditCard,
  Moon,
  Sun,
  WifiOff,
} from 'lucide-react'
import { useTopBarViewModel } from '@/app/hooks/useTopBarViewModel'
import { useThemeStore } from '@/shared/lib/themeStore'
import { pageConfig } from '@/shared/config'
import './Sidebar.css'

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
}

// ─── Маппинг пути → заголовок страницы ───────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  [pageConfig.home]:          'Главная',
  [pageConfig.grades]:        'Оценки',
  [pageConfig.schedule]:      'Расписание',
  [pageConfig.homework]:      'Домашние задания',
  [pageConfig.library]:       'Библиотека',
  [pageConfig.profile]:       'Профиль',
  [pageConfig.notifications]: 'Уведомления',
  [pageConfig.payment]:       'Платежи',
}

// ─── Форматирование даты ──────────────────────────────────────────────────────

function formatDate(): string {
  return new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// ─── Аватар ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  photoUrl: string | null
  fullName: string
}

const Avatar = memo(({ photoUrl, fullName }: AvatarProps) => {
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={fullName}
        className="sidebar-web__avatar sidebar-web__avatar--photo"
      />
    )
  }

  return <div className="sidebar-web__avatar">{initials}</div>
})

Avatar.displayName = 'Avatar'

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const Sidebar = memo(() => {
  const vm = useTopBarViewModel()
  const isOffline = !navigator.onLine
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  const hwBadge = vm?.hasBadge ? 1 : undefined

  // Заголовок текущей страницы
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Журнал'

  const mainNav: NavItem[] = [
    { to: pageConfig.home,     label: 'Главная',         icon: <LayoutDashboard size={16} /> },
    { to: pageConfig.grades,   label: 'Оценки',           icon: <GraduationCap   size={16} /> },
    { to: pageConfig.schedule, label: 'Расписание',       icon: <CalendarDays    size={16} /> },
    { to: pageConfig.homework, label: 'Домашние задания', icon: <BookOpen        size={16} />, badge: hwBadge },
  ]

  const studyNav: NavItem[] = [
    { to: pageConfig.library, label: 'Библиотека', icon: <Library size={16} /> },
    // { to: pageConfig.goals, label: 'Цели', icon: <Star size={16} /> },
  ]

  const otherNav: NavItem[] = [
    { to: pageConfig.profile,       label: 'Профиль',     icon: <User       size={16} /> },
    { to: pageConfig.notifications, label: 'Уведомления', icon: <Bell       size={16} /> },
    { to: pageConfig.payment,       label: 'Платежи',     icon: <CreditCard size={16} /> },
  ]

  return (
    <aside className="sidebar-web">

      {/* ── Шапка: лого + юзер + дата + уведомления ── */}
      <div className="sidebar-web__header">

        {/* Лого */}
        <div
          className="sidebar-web__brand"
          onClick={() => navigate(pageConfig.home)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(pageConfig.home)}
        >
          <span className="sidebar-web__brand-it">IT</span>
          <span className="sidebar-web__brand-top"> TOP</span>
          <span className="sidebar-web__brand-college"> COLLEGE</span>
        </div>

        {/* Юзер + кнопка уведомлений */}
        {vm && (
          <div className="sidebar-web__user">
            <Avatar photoUrl={vm.photoUrl} fullName={vm.fullName} />
            <div className="sidebar-web__user-info">
              <div className="sidebar-web__name">{vm.fullName}</div>
              <div className="sidebar-web__group">{vm.groupName}</div>
              <div className="sidebar-web__date">{formatDate()}</div>
            </div>
            {/* Кнопка уведомлений справа от имени */}
            <button
              className="sidebar-web__notif-btn"
              onClick={() => navigate(pageConfig.notifications)}
              type="button"
              aria-label="Уведомления"
            >
              <Bell size={15} />
              {vm.hasBadge && <span className="sidebar-web__notif-dot" />}
            </button>
          </div>
        )}
      </div>

      {/* ── Заголовок текущей страницы ── */}
      <div className="sidebar-web__page-title">
        {pageTitle}
      </div>

      {/* ── Навигация ── */}
      <nav className="sidebar-web__nav">
        <NavSection label="Главное" items={mainNav} />
        <NavSection label="Учёба"   items={studyNav} />
        <NavSection label="Прочее"  items={otherNav} />
      </nav>

      {/* ── Подвал ── */}
      <div className="sidebar-web__footer">
        {isOffline && (
          <div className="sidebar-web__offline">
            <WifiOff size={13} />
            <span>Нет подключения · ОФЛАЙН</span>
          </div>
        )}

        <button
          className="sidebar-web__theme-btn"
          onClick={toggleTheme}
          type="button"
          aria-label="Переключить тему"
        >
          {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          <span>{theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}</span>
          <div className={`sidebar-web__toggle ${theme === 'dark' ? 'sidebar-web__toggle--on' : ''}`} />
        </button>
      </div>
    </aside>
  )
})

Sidebar.displayName = 'Sidebar'

// ─── NavSection ───────────────────────────────────────────────────────────────

interface NavSectionProps {
  label: string
  items: NavItem[]
}

const NavSection = memo(({ label, items }: NavSectionProps) => (
  <div className="sidebar-web__section">
    <div className="sidebar-web__section-label">{label}</div>
    {items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `sidebar-web__item${isActive ? ' sidebar-web__item--active' : ''}`
        }
      >
        <span className="sidebar-web__item-icon">{item.icon}</span>
        <span className="sidebar-web__item-label">{item.label}</span>
        {item.badge ? (
          <span className="sidebar-web__badge">{item.badge}</span>
        ) : null}
      </NavLink>
    ))}
  </div>
))

NavSection.displayName = 'NavSection'