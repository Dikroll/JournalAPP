import type { PaymentRecord } from "@/entities/payment/model/types";
import { formatDateShort } from "@/shared/utils";
import { formatAmount } from "@/shared/utils/formatUtils";

interface Props {
	history: PaymentRecord[];
	flat?: boolean;
}

export function PaymentHistoryCard({ history, flat }: Props) {
	if (!history.length) return null;

	return (
		<div
			className={
				flat ? "" : "bg-app-surface rounded-3xl border border-app-border p-4"
			}
			style={flat ? undefined : { boxShadow: "var(--shadow-card)" }}
		>
			<p
				className={`text-sm font-semibold text-app-text mb-3 ${flat ? "px-1" : ""}`}
			>
				История платежей
			</p>
			<div className="flex flex-col gap-2">
				{history.map((item, i) => (
					<div
						key={`${item.date}-${item.amount}-${i}`}
						className="flex items-center justify-between bg-app-surface-strong rounded-[16px] p-3"
					>
						<div className="flex-1 min-w-0 mr-3">
							<p className="text-sm font-medium text-app-text truncate">
								{item.description || "Платёж"}
							</p>
							<p className="text-xs text-app-muted">
								{formatDateShort(item.date)}
							</p>
						</div>
						<p className="text-sm font-bold text-status-checked flex-shrink-0">
							+{formatAmount(item.amount)}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
