import {
	BellRing,
	ChevronRight,
	LogOut,
	Moon,
	Settings,
	Sun,
	Trash2,
	Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScheduleRemindersStore } from "@/features/scheduleReminders";
import { pageConfig } from "@/shared/config";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { useThemeStore } from "@/shared/lib/themeStore";

interface Props {
	onAccounts: () => void;
	onClearCache: () => void;
	onLogout: () => void;
}

export function SettingsSection({ onAccounts, onClearCache, onLogout }: Props) {
	const navigate = useNavigate();
	const { theme, toggleTheme } = useThemeStore();
	const remindersEnabled = useScheduleRemindersStore((s) => s.enabled);
	const isDesktop = useIsDesktop();

	return (
		<div
			className="bg-app-surface rounded-3xl border border-app-border overflow-hidden"
			style={{ boxShadow: "var(--shadow-card)" }}
		>
			<div className="flex items-center gap-2 px-5 pt-5 pb-3">
				<Settings size={16} className="text-app-muted" />
				<h3 className="text-sm font-bold text-app-text">Настройки</h3>
			</div>

			<div className="pb-2">
				{/* Аккаунты */}
				<button
					type="button"
					onClick={onAccounts}
					className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-app-surface-hover transition-colors"
					style={{ WebkitTapHighlightColor: "transparent" }}
				>
					<div
						className="w-8 h-8 rounded-xl flex items-center justify-center"
						style={{
							background: "var(--color-brand-subtle)",
							border: "1px solid var(--color-brand-border)",
						}}
					>
						<Users size={15} className="text-brand" />
					</div>
					<span className="flex-1 text-sm font-medium text-app-text text-left">
						Аккаунты
					</span>
					<span className="text-xs text-app-faint">Переключить</span>
				</button>

				<div
					className="mx-4 h-px"
					style={{ background: "var(--color-border)" }}
				/>

				{/* Тема */}
				<button
					type="button"
					onClick={toggleTheme}
					className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-app-surface-hover transition-colors"
					style={{ WebkitTapHighlightColor: "transparent" }}
				>
					<div
						className="w-8 h-8 rounded-xl flex items-center justify-center"
						style={{
							background: "var(--color-surface-strong)",
							border: "1px solid var(--color-border)",
						}}
					>
						{theme === "dark" ? (
							<Moon size={15} className="text-app-muted" />
						) : (
							<Sun size={15} className="text-app-muted" />
						)}
					</div>
					<span className="flex-1 text-sm font-medium text-app-text text-left">
						Тема
					</span>
					<div
						className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
							theme === "dark" ? "bg-brand" : "bg-app-border-strong"
						}`}
					>
						<div
							className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
								theme === "dark" ? "translate-x-5" : "translate-x-0"
							}`}
						/>
					</div>
				</button>

				<div
					className="mx-4 h-px"
					style={{ background: "var(--color-border)" }}
				/>

				{!isDesktop && (
					<>
						{/* Уведомления */}
						<button
							type="button"
							onClick={() => navigate(pageConfig.notificationSettings)}
							className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-app-surface-hover transition-colors"
							style={{ WebkitTapHighlightColor: "transparent" }}
						>
							<div
								className="w-8 h-8 rounded-xl flex items-center justify-center"
								style={{
									background: remindersEnabled
										? "var(--color-brand-subtle)"
										: "var(--color-surface-strong)",
									border: remindersEnabled
										? "1px solid var(--color-brand-border)"
										: "1px solid var(--color-border)",
								}}
							>
								<BellRing
									size={15}
									className={remindersEnabled ? "text-brand" : "text-app-muted"}
								/>
							</div>
							<span className="flex-1 text-sm font-medium text-app-text text-left">
								Уведомления
							</span>
							<span className="text-xs text-app-faint">
								{remindersEnabled ? "Вкл" : "Выкл"}
							</span>
							<ChevronRight size={16} className="text-app-faint" />
						</button>

						<div
							className="mx-4 h-px"
							style={{ background: "var(--color-border)" }}
						/>
					</>
				)}

				{/* Очистить кэш */}
				<button
					type="button"
					onClick={onClearCache}
					className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-app-surface-hover transition-colors"
					style={{ WebkitTapHighlightColor: "transparent" }}
				>
					<div className="w-8 h-8 rounded-xl flex items-center justify-center bg-danger-subtle border border-danger-border">
						<Trash2 size={15} className="text-danger" />
					</div>
					<span className="flex-1 text-sm font-medium text-app-text text-left">
						Очистить кэш
					</span>
					<span className="text-xs text-app-faint">Сброс</span>
				</button>

				<div
					className="mx-4 h-px"
					style={{ background: "var(--color-border)" }}
				/>

				{/* Выход */}
				<button
					type="button"
					onClick={onLogout}
					className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-danger-subtle transition-colors"
					style={{ WebkitTapHighlightColor: "transparent" }}
				>
					<div className="w-8 h-8 rounded-xl flex items-center justify-center bg-danger-subtle border border-danger-border">
						<LogOut size={15} className="text-danger" />
					</div>
					<span className="flex-1 text-sm font-medium text-danger text-left">
						Выход
					</span>
				</button>
			</div>
		</div>
	);
}
