import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
	title: string;
	icon?: LucideIcon;
	children: ReactNode;
}

export function SectionCard({ title, icon: Icon, children }: Props) {
	return (
		<div
			className="bg-app-surface rounded-3xl border border-app-border overflow-hidden"
			style={{ boxShadow: "var(--shadow-card)" }}
		>
			<div className="flex items-center gap-2 px-5 pt-5 pb-3">
				{Icon && <Icon size={16} className="text-app-muted" />}
				<h3 className="text-sm font-bold text-app-text">{title}</h3>
			</div>
			<div className="pb-2">{children}</div>
		</div>
	);
}
