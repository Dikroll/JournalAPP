import { Coins, Gem } from "lucide-react";

export interface BalanceCardProps {
	type: "diamonds" | "coins";
	label: string;
	amount: number;
	className?: string;
}

export function BalanceCard({
	type,
	label,
	amount,
	className = "",
}: BalanceCardProps) {
	const isDiamonds = type === "diamonds";
	const Icon = isDiamonds ? Coins : Gem;
	const colorClass = isDiamonds ? "text-[#FFD700]" : "text-[#00D9FF]";

	return (
		<div
			className={`flex items-center gap-3 rounded-3xl border border-app-border bg-app-surface-hover p-4 ${className}`}
		>
			<div
				className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
				style={{ background: "var(--color-surface)" }}
			>
				<Icon size={20} className={colorClass} />
			</div>
			<div className="min-w-0">
				<p className="mb-1 text-xs leading-tight text-app-muted">{label}</p>
				<p className="truncate text-xl font-bold leading-tight text-app-text">
					{amount.toLocaleString("ru-RU")}
				</p>
			</div>
		</div>
	);
}
