import { ArrowRight, ShoppingBag, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import type { UserInfo } from "@/entities/user";
import { pageConfig } from "@/shared/config";

interface Props {
	user: UserInfo;
}

import { BalanceCard, SurfaceCard } from "@/shared/ui";

export function DesktopMarketWidget({ user }: Props) {
	const topmoney = user.points.diamonds.balance;
	const topgems = user.points.coins.balance;

	return (
		<SurfaceCard padding="lg" style={{ boxShadow: "var(--shadow-card)" }}>
			<div className="flex items-center gap-2 mb-5">
				<Wallet size={16} className="text-app-muted" />
				<h3 className="text-sm font-bold text-app-text">Баланс</h3>
			</div>

			<div className="grid grid-cols-2 gap-3 mb-5">
				<BalanceCard type="diamonds" label="Топмани" amount={topmoney} />
				<BalanceCard type="coins" label="Топгемы" amount={topgems} />
			</div>

			<Link
				to={pageConfig.market}
				className="flex items-center justify-center gap-2 w-full py-4 rounded-3xl text-white font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
				style={{
					background:
						"linear-gradient(90deg, var(--color-gradient-from) 0%, var(--color-gradient-to) 100%)",
				}}
			>
				Перейти в магазин
				<ShoppingBag size={18} className="text-white/80 ml-2" />
				<ArrowRight size={16} className="text-white/60" />
			</Link>
		</SurfaceCard>
	);
}
