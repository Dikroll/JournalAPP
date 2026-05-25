import { Coins, Diamond } from "lucide-react";
import type { MarketPrice } from "@/entities/market";

interface Props {
	price: MarketPrice;
	className?: string;
}

export function PriceDisplay({ price, className = "" }: Props) {
	const parts: React.ReactNode[] = [];

	if (price.diamonds) {
		parts.push(
			<span key="diamonds" className="inline-flex items-center gap-1">
				<Coins size={15} className="text-[#FFD700]" />
				{price.diamonds.toLocaleString("ru-RU")}
			</span>,
		);
	}

	if (price.coins) {
		parts.push(
			<span key="coins" className="inline-flex items-center gap-1">
				<Diamond size={15} className="text-[#00D9FF]" />
				{price.coins.toLocaleString("ru-RU")}
			</span>,
		);
	}

	if (parts.length === 0) {
		return <span className={className}>Бесплатно</span>;
	}

	return (
		<div
			className={`flex flex-wrap items-center gap-2 font-semibold text-app-text ${className}`}
		>
			{parts}
		</div>
	);
}
