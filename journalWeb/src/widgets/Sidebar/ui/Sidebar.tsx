import { memo } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
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
import { Avatar, Badge } from '@/shared/ui'
import { useUserStore } from '@/entities/user'
import type { NavItemConfig } from '@/shared/config/navigation'

const PAGE_TITLES: Record<string, string> = {
	[pageConfig.home]: "Главная",
	[pageConfig.grades]: "Оценки",
	[pageConfig.schedule]: "Расписание",
	[pageConfig.homework]: "Домашние задания",
	[pageConfig.library]: "Библиотека",
	[pageConfig.profile]: "Профиль",
	[pageConfig.payment]: "Платежи",
	[pageConfig.market]: "Маркет",
};

function formatDateParts() {
	const now = new Date();
	const weekday = now.toLocaleDateString("ru-RU", { weekday: "long" });
	const dayMonth = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
	return {
		weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
		dayMonth,
	};
}

export const Sidebar = memo(() => {
	const vm = useTopBarViewModel()
	const user = useUserStore(state => state.user)
	const isOffline = !useNetworkStore(state => state.isOnline)
	const { theme, toggleTheme } = useThemeStore()
	const navigate = useNavigate()
	const location = useLocation()

	const hwBadge = vm?.hasBadge ? 1 : undefined;
	const pageTitle = PAGE_TITLES[location.pathname] ?? "Журнал";

	const coins = user?.points?.coins?.balance ?? null
	const diamonds = user?.points?.diamonds?.balance ?? null
	const isDebtor = user?.is_debtor ?? false

	const { weekday, dayMonth } = formatDateParts();

	return (
		<aside className="w-[14rem] shrink-0 flex flex-col h-full bg-transparent border-r border-app-border select-none">
			{/* Header */}
			<div className="shrink-0 p-4 border-b border-app-border">
				{/* Logo */}
				<button
					type="button"
					onClick={() => navigate(pageConfig.home)}
					className="flex items-center text-sm font-bold tracking-wide mb-4 hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 rounded"
				>
					<span className="bg-brand text-white px-1.5 py-0.5 rounded text-[11px] font-extrabold mr-1">IT</span>
					<span className="text-app-text">TOP</span>
					<span className="text-app-muted ml-1 font-semibold">COLLEGE</span>
				</button>

				{/* Date */}
				<div className="flex items-center gap-1.5 mb-4 text-xs font-bold">
					<span className="text-brand capitalize">{weekday}</span>
					<span className="text-app-muted">•</span>
					<span className="text-app-text">{dayMonth}</span>
				</div>

				{/* User Block */}
				{vm && (
					<button
						type="button"
						className="w-full flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-app-surface-hover transition-colors text-left group"
						onClick={() => navigate(pageConfig.profile)}
					>
						<Avatar photoUrl={vm.photoUrl} fullName={vm.fullName} />
						<div className="flex-1 min-w-0">
							<div className="text-xs font-semibold text-app-text truncate group-hover:text-brand transition-colors">
								{vm.shortName}
							</div>
							<div className="text-[11px] text-app-muted truncate mt-0.5 flex items-center gap-1">
								{vm.groupName}
								{isDebtor && (
									<span className="text-[8px] uppercase tracking-wider font-bold bg-danger/10 text-danger px-1 py-0.5 rounded">Долг</span>
								)}
							</div>
							{(coins !== null || diamonds !== null) && (
								<div className="flex items-center gap-1.5 mt-1">
									{diamonds !== null && (
										<div className="flex items-center gap-1 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#eab308] px-1.5 py-0.5 rounded-md text-[10px] font-bold">
											<Coins size={10} />
											<span>{diamonds}</span>
										</div>
									)}
									{coins !== null && (
										<div className="flex items-center gap-1 bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#0ea5e9] px-1.5 py-0.5 rounded-md text-[10px] font-bold">
											<Gem size={10} />
											<span>{coins}</span>
										</div>
									)}
								</div>
							)}
						</div>
					</button>
				)}
			</div>

			{/* Page Title */}
			<div className="shrink-0 px-4 py-3 border-b border-app-border">
				<h1 className="text-lg font-bold text-app-text tracking-tight">{pageTitle}</h1>
			</div>

			{/* Nav */}
			<nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 no-scrollbar">
				<NavSection label="Главное" items={mainNavItems} hwBadge={hwBadge} />
				<NavSection label="Учёба" items={studyNavItems} />
				<NavSection label="Быстрый переход" items={quickLinksNavItems} />
			</nav>

			{/* Footer */}
			<div className="shrink-0 p-2 border-t border-app-border space-y-1">
				{isOffline && (
					<div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[11px] font-semibold">
						<WifiOff size={14} />
						<span>ОФЛАЙН</span>
					</div>
				)}
				<button
					type="button"
					onClick={toggleTheme}
					className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-app-muted hover:bg-app-surface-hover hover:text-app-text transition-colors"
				>
					{theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
					<span className="flex-1 text-left">{theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}</span>
					<div className={`relative w-8 h-4 rounded-full transition-colors ${theme === 'dark' ? 'bg-brand' : 'bg-app-border-strong'}`}>
						<div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`} />
					</div>
				</button>
			</div>
		</aside>
	)
})

Sidebar.displayName = 'Sidebar'

const NavSection = memo(({ label, items, hwBadge }: { label: string; items: NavItemConfig[]; hwBadge?: number }) => (
	<div>
		<div className="text-[10px] font-bold tracking-wider uppercase text-app-faint px-2 mb-1">
			{label}
		</div>
		<div className="space-y-0.5">
			{items.map((item) => (
				<NavLink
					key={item.to}
					to={item.to}
					className={({ isActive }) =>
						`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
							isActive
								? 'bg-brand/10 text-brand shadow-sm'
								: 'text-app-muted hover:bg-app-surface-hover hover:text-app-text'
						}`
					}
				>
					<div className="flex items-center justify-center shrink-0">
						<item.icon size={16} />
					</div>
					<span className="flex-1 truncate">{item.label}</span>
					{item.to === pageConfig.homework && hwBadge ? (
						<Badge className="!border-none !m-0 !h-5 !min-w-[20px] !px-1.5 flex items-center justify-center bg-brand text-white text-[10px] font-bold rounded-md">
							{hwBadge}
						</Badge>
					) : null}
				</NavLink>
			))}
		</div>
	</div>
))

NavSection.displayName = "NavSection"
