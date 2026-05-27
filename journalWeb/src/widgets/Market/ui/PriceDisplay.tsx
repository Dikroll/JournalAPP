import type { MarketPrice } from '@/entities/market'
import { CurrencyBadge } from '@/shared/ui'

interface Props {
	price: MarketPrice;
	className?: string;
}

export function PriceDisplay({ price, className = "" }: Props) {
	const parts: React.ReactNode[] = [];

	if (price.diamonds) {
		parts.push(
			<CurrencyBadge key="diamonds" type="diamonds" amount={price.diamonds} size="md" />
		);
	}

	if (price.coins) {
		parts.push(
			<CurrencyBadge key="coins" type="coins" amount={price.coins} size="md" />
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
