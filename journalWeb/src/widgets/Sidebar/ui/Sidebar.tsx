import {
  Moon,
  Sun,
  WifiOff,
  Gem,
  Coins,
} from 'lucide-react'
import { useTopBarViewModel } from '@/features/navigation/hooks/useTopBarViewModel'
import { useThemeStore } from '@/shared/lib/themeStore'
import { useNetworkStore } from '@/shared/model/networkStore'
import { pageConfig, mainNavItems, studyNavItems, quickLinksNavItems } from '@/shared/config'
import { Avatar, BrandLogo, Badge } from '@/shared/ui'
import { useUserStore } from '@/entities/user'
import './Sidebar.css'

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface NavItem {
	to: string;
	label: string;
	icon: React.ReactNode;
	badge?: number;
}

// ─── Маппинг пути → заголовок страницы ───────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
	[pageConfig.home]: "Главная",
	[pageConfig.grades]: "Оценки",
	[pageConfig.schedule]: "Расписание",
	[pageConfig.homework]: "Домашние задания",
	[pageConfig.library]: "Библиотека",
	[pageConfig.profile]: "Профиль",
	[pageConfig.payment]: "Платежи",
};

// ─── Форматирование даты ──────────────────────────────────────────────────────

function formatDateParts(): { weekday: string; dayMonth: string } {
	const now = new Date();
	const weekday = now.toLocaleDateString("ru-RU", { weekday: "long" });
	const dayMonth = now.toLocaleDateString("ru-RU", {
		day: "numeric",
		month: "long",
	});
	return {
		weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
		dayMonth,
	};
}

// Removed local Avatar component in favor of shared/ui

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const Sidebar = memo(() => {
  const vm = useTopBarViewModel()
  const user = useUserStore(state => state.user)
  const isOffline = !useNetworkStore(state => state.isOnline)
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

	const hwBadge = vm?.hasBadge ? 1 : undefined;
	const pageTitle = PAGE_TITLES[location.pathname] ?? "Журнал";

  const coins = user?.points?.coins?.earned ?? null
  const diamonds = user?.points?.diamonds?.earned ?? null

	const { weekday, dayMonth } = formatDateParts();

  const mainNav: NavItem[] = mainNavItems.map(item => ({
    to: item.to,
    label: item.label,
    icon: <item.icon size={16} />,
    badge: item.to === pageConfig.homework ? hwBadge : undefined
  }))

  const studyNav: NavItem[] = studyNavItems.map(item => ({
    to: item.to,
    label: item.label,
    icon: <item.icon size={16} />
  }))

  const quickLinksNav: NavItem[] = quickLinksNavItems.map(item => ({
    to: item.to,
    label: item.label,
    icon: <item.icon size={16} />
  }))

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
					onKeyDown={(e) => e.key === "Enter" && navigate(pageConfig.home)}
				>
					<span className="sidebar-web__brand-it">IT</span>
					<span className="sidebar-web__brand-top"> TOP</span>
					<span className="sidebar-web__brand-college"> COLLEGE</span>
				</div>

				{/* Дата */}
				<div className="sidebar-web__date-block sidebar-web__date-block--main">
					<span className="sidebar-web__date-weekday">{weekday}</span>
					<span className="sidebar-web__date-dot">·</span>
					<span className="sidebar-web__date-day">{dayMonth}</span>
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

        {/* Лого */}
        <BrandLogo size="sm" className="mb-[0.875rem]" />

        {/* Дата под лого */}
        <div className="sidebar-web__date-block-top">
          <span className="sidebar-web__date-weekday-top">{weekday}</span>
          <span className="sidebar-web__date-day-top">{dayMonth}</span>
        </div>

        {/* Юзер — клик на аватар/имя → профиль */}
        {vm && (
          <button
            type="button"
            className="sidebar-web__user sidebar-web__user--clickable"
            onClick={() => navigate(pageConfig.profile)}
            title="Перейти в профиль"
          >
            <Avatar photoUrl={vm.photoUrl} fullName={vm.fullName} size="2.25rem" />
            <div className="sidebar-web__user-info">
              <div className="sidebar-web__name">{vm.shortName}</div>
              <div className="sidebar-web__group">{vm.groupName}</div>

              {/* Счётчики монет и кристаллов */}
              {(coins !== null || diamonds !== null) && (
                <div className="sidebar-web__counters">
                  {diamonds !== null && (
                    <span className="sidebar-web__counter sidebar-web__counter--coins">
                      <Coins size={11} className="text-[#FFD700]" />
                      <span>{diamonds}</span>
                    </span>
                  )}
                  {coins !== null && (
                    <span className="sidebar-web__counter sidebar-web__counter--gems">
                      <Gem size={11} className="text-[#00D9FF]" />
                      <span>{coins}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        )}

				<button
					className="sidebar-web__theme-btn"
					onClick={toggleTheme}
					type="button"
					aria-label="Переключить тему"
				>
					{theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
					<span>{theme === "dark" ? "Тёмная тема" : "Светлая тема"}</span>
					<div
						className={`sidebar-web__toggle ${theme === "dark" ? "sidebar-web__toggle--on" : ""}`}
					/>
				</button>
			</div>
		</aside>
	);
});

      </div>

      {/* ── Заголовок страницы ── */}
      <div className="sidebar-web__page-title">{pageTitle}</div>

      {/* ── Навигация ── */}
      <nav className="sidebar-web__nav">
        <NavSection label="Главное" items={mainNav} />
        <NavSection label="Учёба"   items={studyNav} />

        <NavSection label="Быстрый переход" items={quickLinksNav} />
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
	label: string;
	items: NavItem[];
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
          <Badge className="sidebar-web__badge !border-none !m-0 !h-auto flex items-center justify-center">{item.badge}</Badge>
        ) : null}
      </NavLink>
    ))}
  </div>
))

NavSection.displayName = "NavSection";
