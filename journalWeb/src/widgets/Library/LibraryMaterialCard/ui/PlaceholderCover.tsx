import { FileText } from "lucide-react";
import {
	TYPE_PLACEHOLDER_ICONS,
	TYPE_PLACEHOLDER_ICONS_LG,
} from "../lib/constants";

interface Props {
	materialType: number;
	typeColor: { border: string; bg: string; text: string };
}

export function PlaceholderCover({ materialType, typeColor }: Props) {
	return (
		<div
			className="w-full flex items-center justify-center relative overflow-hidden"
			style={{
				height: 120,
				background: `linear-gradient(135deg, ${typeColor.bg} 0%, var(--color-surface-strong) 100%)`,
				borderBottom: `1px solid ${typeColor.border}`,
			}}
		>
			{/* Декоративная иконка на фоне */}
			<span
				className="absolute opacity-[0.07]"
				style={{ color: typeColor.text, right: -8, bottom: -8 }}
			>
				{TYPE_PLACEHOLDER_ICONS_LG[materialType] ?? <FileText size={96} />}
			</span>

			{/* Основная иконка */}
			<div
				className="w-12 h-12 rounded-3xl flex items-center justify-center"
				style={{
					background: "rgba(255,255,255,0.06)",
					border: `1.5px solid ${typeColor.border}`,
				}}
			>
				<span style={{ color: typeColor.text }}>
					{TYPE_PLACEHOLDER_ICONS[materialType] ?? <FileText size={28} />}
				</span>
			</div>
		</div>
	);
}
