import { ChevronDown, ChevronUp } from "lucide-react";
import type { MarketOrder } from "@/entities/market";

interface Props {
	order: MarketOrder;
	isExpanded: boolean;
	onToggle: () => void;
	isLoading?: boolean;
	isError?: boolean;
	totalPrice?: any;
	children?: React.ReactNode;
}

const ORDER_STATUS: Record<number, string> = {
	1: "Новый",
	2: "Отменен",
	3: "Закрыт",
};

function formatDate(value: string) {
	const normalized = value.includes("T") ? value : value.replace(" ", "T");
	const date = new Date(normalized);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString("ru-RU", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function OrderCard({
	order,
	isExpanded,
	onToggle,
	isLoading = false,
	isError = false,
	totalPrice,
	children,
}: Props) {
	return (
		<article className="bg-app-surface rounded-3xl border border-app-border overflow-hidden">
			<button
				type="button"
				onClick={onToggle}
				className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-app-surface-hover transition"
			>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-3 mb-1">
						<h2 className="text-sm font-semibold text-app-text">
							Заказ #{order.id}
						</h2>
						{totalPrice && (
							<span className="text-xs font-semibold text-app-muted">
								{totalPrice.diamonds ? `💎 ${totalPrice.diamonds}` : ""}
								{totalPrice.diamonds && totalPrice.coins ? " • " : ""}
								{totalPrice.coins ? `🪙 ${totalPrice.coins}` : ""}
							</span>
						)}
					</div>
					<p className="text-xs text-app-muted">
						{formatDate(order.created_at)}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs text-brand">
						{ORDER_STATUS[order.status] ?? `Статус ${order.status}`}
					</span>
					{isExpanded ? (
						<ChevronUp size={18} className="text-app-muted" />
					) : (
						<ChevronDown size={18} className="text-app-muted" />
					)}
				</div>
			</button>

			{isExpanded && (
				<div className="px-4 pb-4 border-t border-app-border">
					{isLoading ? (
						<p className="text-sm text-app-muted pt-4">Загружаем детали...</p>
					) : isError ? (
						<p className="text-sm text-app-muted pt-4">
							Не удалось загрузить детали заказа
						</p>
					) : children ? (
						children
					) : (
						<p className="text-sm text-app-muted pt-4">
							Детали заказа пока пустые
						</p>
					)}
				</div>
			)}
		</article>
	);
}
