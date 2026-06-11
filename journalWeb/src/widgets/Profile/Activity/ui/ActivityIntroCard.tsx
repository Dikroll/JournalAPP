import { Coins, Gem } from "lucide-react";

export function ActivityIntroCard({ desktop = false }: { desktop?: boolean }) {
	return (
		<div
			className={`${desktop ? "rounded-3xl p-7 min-h-[168px]" : "rounded-3xl p-5"} border border-app-border relative overflow-hidden`}
			style={{
				boxShadow: "var(--shadow-card)",
				background:
					"radial-gradient(circle at top right, rgba(255,215,0,0.18), transparent 32%), radial-gradient(circle at bottom left, rgba(0,217,255,0.16), transparent 40%), linear-gradient(135deg, rgba(0,217,255,0.08), rgba(255,215,0,0.08)), var(--color-surface)",
			}}
		>
			<div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#FFD700]/10 blur-2xl pointer-events-none" />
			<div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#00D9FF]/10 blur-2xl pointer-events-none" />

			<div className="relative flex items-start justify-between gap-4 h-full">
				<div>
					<p
						className={`${desktop ? "text-xl" : "text-sm"} font-semibold text-app-text`}
					>
						История начислений
					</p>
					<p
						className={`${desktop ? "text-sm max-w-[28rem] leading-6 mt-3" : "text-xs max-w-[18rem] mt-1"} text-app-muted`}
					>
						Здесь собраны все последние начисления топмани и топгемов.
					</p>
					{desktop && (
						<div className="mt-5 flex flex-wrap gap-2">
							<span className="rounded-full border border-app-border bg-app-surface/70 px-3 py-1 text-xs font-medium text-app-muted">
								Начисления
							</span>
							<span className="rounded-full border border-app-border bg-app-surface/70 px-3 py-1 text-xs font-medium text-app-muted">
								Списания
							</span>
							<span className="rounded-full border border-app-border bg-app-surface/70 px-3 py-1 text-xs font-medium text-app-muted">
								Фильтры по валюте
							</span>
						</div>
					)}
				</div>

				<div
					className={`${desktop ? "items-end gap-3 pt-1" : "items-center gap-2"} flex shrink-0`}
				>
					<div
						className={`${desktop ? "w-14 h-14 rounded-3xl" : "w-10 h-10 rounded-3xl"} bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center`}
					>
						<Coins size={desktop ? 24 : 18} className="text-[#FFD700]" />
					</div>
					<div
						className={`${desktop ? "w-14 h-14 rounded-3xl" : "w-10 h-10 rounded-3xl"} bg-[#00D9FF]/10 border border-[#00D9FF]/20 flex items-center justify-center`}
					>
						<Gem size={desktop ? 24 : 18} className="text-[#00D9FF]" />
					</div>
				</div>
			</div>
		</div>
	);
}
