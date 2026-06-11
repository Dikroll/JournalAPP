import { Moon, Sun, WifiOff } from "lucide-react";
import { memo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useHomeworkBadgeCount } from "@/entities/homework";
import { useUserStore } from "@/entities/user";
import { useTopBarViewModel } from "@/features/navigation/hooks/useTopBarViewModel";
import {
	mainNavItems,
	PAGE_TITLES,
	pageConfig,
	quickLinksNavItems,
	studyNavItems,
} from "@/shared/config";
import type { NavItemConfig } from "@/shared/config/navigation";
import { useThemeStore } from "@/shared/lib/themeStore";
import { useNetworkStore } from "@/shared/model/networkStore";
import { Avatar, Badge, BrandLogo, CurrencyBadge } from "@/shared/ui";
import { getTodayDateParts } from "@/shared/utils/dateUtils";

export const Sidebar = memo(() => {
	const vm = useTopBarViewModel();
	const user = useUserStore((state) => state.user);
	const isOffline = !useNetworkStore((state) => state.isOnline);
	const { theme, toggleTheme } = useThemeStore();
	const navigate = useNavigate();
	const location = useLocation();

	const homeworkCount = useHomeworkBadgeCount();
	const hwBadge = homeworkCount > 0 ? homeworkCount : undefined;
	const pageTitle = PAGE_TITLES[location.pathname] ?? "Журнал";

	const coins = user?.points?.coins?.earned ?? null;
	const diamonds = user?.points?.diamonds?.earned ?? null;
	const isDebtor = user?.is_debtor ?? false;

	const { weekday, dayMonth } = getTodayDateParts();

	return (
		<aside className="web-sidebar w-[14rem] shrink-0 flex flex-col h-full bg-transparent border-r border-app-border select-none">
			{/* Header */}
			<div className="web-sidebar__header shrink-0 p-4 border-b border-app-border">
				{/* Logo */}
				<BrandLogo
					size="sm"
					className="web-sidebar__logo mb-4 hover:opacity-80 transition-opacity"
				/>

				{/* Date */}
				<div className="web-sidebar__date flex items-center gap-1.5 mb-4 text-xs font-bold">
					<span className="text-brand capitalize">{weekday}</span>
					<span className="text-app-muted">•</span>
					<span className="text-app-text">{dayMonth}</span>
				</div>

				{/* User Block */}
				{vm && (
					<button
						type="button"
						className="web-sidebar__user w-full flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-lg hover:bg-app-surface-hover transition-colors text-left group"
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
									<span className="text-[8px] uppercase tracking-wider font-bold bg-danger/10 text-danger px-1 py-0.5 rounded">
										Долг
									</span>
								)}
							</div>
							{(coins !== null || diamonds !== null) && (
								<div className="flex items-center gap-1.5 mt-1">
									{diamonds !== null && (
										<CurrencyBadge
											type="diamonds"
											amount={diamonds}
											size="sm"
										/>
									)}
									{coins !== null && (
										<CurrencyBadge type="coins" amount={coins} size="sm" />
									)}
								</div>
							)}
						</div>
					</button>
				)}
			</div>

			{/* Page Title */}
			<div className="web-sidebar__page-title shrink-0 px-4 py-3 border-b border-app-border">
				<h1 className="text-lg font-bold text-app-text tracking-tight">
					{pageTitle}
				</h1>
			</div>

			{/* Nav */}
			<nav className="web-sidebar__nav flex-1 overflow-hidden p-2 space-y-4">
				<NavSection label="Главное" items={mainNavItems} hwBadge={hwBadge} />
				<NavSection label="Учёба" items={studyNavItems} />
				<NavSection label="Быстрый переход" items={quickLinksNavItems} />
			</nav>

			{/* Footer */}
			<div className="web-sidebar__footer shrink-0 p-2 border-t border-app-border space-y-1">
				{isOffline && (
					<div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[11px] font-semibold">
						<WifiOff size={14} />
						<span>ОФЛАЙН</span>
					</div>
				)}
				<button
					type="button"
					onClick={toggleTheme}
					className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-app-muted hover:bg-app-surface-hover hover:text-app-text transition-colors"
				>
					{theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
					<span className="flex-1 text-left">
						{theme === "dark" ? "Тёмная тема" : "Светлая тема"}
					</span>
					<div
						className={`relative w-8 h-4 rounded-full transition-colors ${
							theme === "dark" ? "bg-brand" : "bg-app-border-strong"
						}`}
					>
						<div
							className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
								theme === "dark" ? "translate-x-4" : ""
							}`}
						/>
					</div>
				</button>
			</div>
		</aside>
	);
});

Sidebar.displayName = "Sidebar";

const NavSection = memo(
	({
		label,
		items,
		hwBadge,
	}: {
		label: string;
		items: NavItemConfig[];
		hwBadge?: number;
	}) => (
		<div className="web-sidebar__section">
			<div className="web-sidebar__section-label text-[10px] font-bold tracking-wider uppercase text-app-faint px-2 mb-1">
				{label}
			</div>
			<div className="web-sidebar__section-items space-y-0.5">
				{items.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							`web-sidebar__link flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
								isActive
									? "bg-brand/10 shadow-sm"
									: "text-app-muted hover:bg-app-surface-hover hover:text-app-text"
							}`
						}
					>
						{({ isActive }) => (
							<>
								<div
									className={`flex items-center justify-center shrink-0 ${
										isActive ? "text-brand" : ""
									}`}
								>
									<item.icon size={16} />
								</div>
								<span
									className={`flex-1 truncate ${isActive ? "text-app-text" : ""}`}
								>
									{item.label}
								</span>
								{item.to === pageConfig.homework && hwBadge ? (
									<Badge className="!border-none !m-0 !h-5 !min-w-[20px] !px-1.5 flex items-center justify-center bg-brand text-white text-[10px] font-bold rounded-md">
										{hwBadge}
									</Badge>
								) : null}
							</>
						)}
					</NavLink>
				))}
			</div>
		</div>
	),
);

NavSection.displayName = "NavSection";
