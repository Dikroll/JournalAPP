import { Coins, Gem } from "lucide-react";
import { Link } from "react-router-dom";

export interface CurrencyBadgeProps {
	type: "diamonds" | "coins";
	amount: number;
	size?: "sm" | "md" | "lg";
	to?: string;
	state?: any;
	className?: string;
}

export function CurrencyBadge({
	type,
	amount,
	size = "sm",
	to,
	state,
	className = "",
}: CurrencyBadgeProps) {
	const isDiamonds = type === "diamonds";

	// Size configurations
	const iconSize = size === "sm" ? 10 : size === "md" ? 15 : 18;
	const paddingAndText =
		size === "sm"
			? "px-1.5 py-0.5 text-[10px]"
			: size === "md"
				? "px-2 py-1 text-xs"
				: "px-3 py-1.5 text-sm";

	// Colors matching the original design
	// Diamonds = Coins icon (yellow)
	// Coins = Gem icon (blue)
	const Icon = isDiamonds ? Coins : Gem;
	const colorClasses = isDiamonds
		? "bg-[#FFD700]/10 border-[#FFD700]/30 text-[#eab308]"
		: "bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#0ea5e9]";

	const baseClasses = `inline-flex items-center gap-1 border font-bold rounded-md transition-all ${colorClasses} ${paddingAndText} ${className}`;
	const clickableClasses = to ? "hover:opacity-80 active:scale-95 cursor-pointer" : "";

	const content = (
		<>
			<Icon size={iconSize} />
			<span>{amount.toLocaleString("ru-RU")}</span>
		</>
	);

	if (to) {
		return (
			<Link to={to} state={state} className={`${baseClasses} ${clickableClasses}`}>
				{content}
			</Link>
		);
	}

	return <div className={`${baseClasses} ${clickableClasses}`}>{content}</div>;
}
