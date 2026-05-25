import { memo } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  BookOpen,
  Library,
  Star,
  Moon,
  Sun,
  WifiOff,
  Newspaper,
  Gem,
  Coins,
} from 'lucide-react'
import { useTopBarViewModel } from '@/app/hooks/useTopBarViewModel'
import { useThemeStore } from '@/shared/lib/themeStore'
import { pageConfig } from '@/shared/config'
import { useUserStore } from '@/entities/user'
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
  [pageConfig.home]:     'Главная',
  [pageConfig.grades]:   'Оценки',
  [pageConfig.schedule]: 'Расписание',
  [pageConfig.homework]: 'Домашние задания',
  [pageConfig.library]:  'Библиотека',
  [pageConfig.profile]:  'Профиль',
  [pageConfig.payment]:  'Платежи',
}

// ─── Форматирование даты ──────────────────────────────────────────────────────

function formatDateParts(): { weekday: string; dayMonth: string } {
  const now = new Date()
  const weekday = now.toLocaleDateString('ru-RU', { weekday: 'long' })
  const dayMonth = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    dayMonth,
  }
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
  const user = useUserStore(state => state.user)
  const isOffline = !navigator.onLine
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  const hwBadge = vm?.hasBadge ? 1 : undefined
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Журнал'

  const coins = user?.points?.coins?.balance ?? null
  const diamonds = user?.points?.diamonds?.balance ?? null

  const { weekday, dayMonth } = formatDateParts()

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



  return (
    <aside className="sidebar-web">

      {/* ── Шапка: лого + юзер ── */}
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

        {/* Юзер — клик на аватар/имя → профиль */}
        {vm && (
          <button
            type="button"
            className="sidebar-web__user sidebar-web__user--clickable"
            onClick={() => navigate(pageConfig.profile)}
            title="Перейти в профиль"
          >
            <Avatar photoUrl={vm.photoUrl} fullName={vm.fullName} />
            <div className="sidebar-web__user-info">
              <div className="sidebar-web__name">{vm.shortName}</div>
              <div className="sidebar-web__group">{vm.groupName}</div>

              {/* Дата */}
              <div className="sidebar-web__date-block">
                <span className="sidebar-web__date-weekday">{weekday}</span>
                <span className="sidebar-web__date-dot">·</span>
                <span className="sidebar-web__date-day">{dayMonth}</span>
              </div>

              {/* Счётчики монет и кристаллов */}
              {(coins !== null || diamonds !== null) && (
                <div className="sidebar-web__counters">
                  {coins !== null && (
                    <span className="sidebar-web__counter sidebar-web__counter--coins">
                      <Coins size={11} />
                      <span>{coins}</span>
                    </span>
                  )}
                  {diamonds !== null && (
                    <span className="sidebar-web__counter sidebar-web__counter--gems">
                      <Gem size={11} />
                      <span>{diamonds}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        )}


      </div>

      {/* ── Заголовок страницы ── */}
      <div className="sidebar-web__page-title">{pageTitle}</div>

      {/* ── Навигация ── */}
      <nav className="sidebar-web__nav">
        <NavSection label="Главное" items={mainNav} />
        <NavSection label="Учёба"   items={studyNav} />

        {/* Быстрый переход на вкладки страницы уведомлений */}
        <div className="sidebar-web__section">
          <div className="sidebar-web__section-label">Быстрый переход</div>
          <button
            className={`sidebar-web__item sidebar-web__item--btn`}
            onClick={() => navigate(pageConfig.evaluateLesson)}
            type="button"
          >
            <span className="sidebar-web__item-icon"><Star size={16} /></span>
            <span className="sidebar-web__item-label">Оценка занятий</span>
          </button>
          <button
            className={`sidebar-web__item sidebar-web__item--btn`}
            onClick={() => navigate(pageConfig.news)}
            type="button"
          >
            <span className="sidebar-web__item-icon"><Newspaper size={16} /></span>
            <span className="sidebar-web__item-label">Новости</span>
          </button>
        </div>
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