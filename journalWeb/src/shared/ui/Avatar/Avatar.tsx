import type { CSSProperties } from "react";
import { getInitials } from "@/shared/utils/nameUtils";

interface Props {
	fullName: string;
	photoUrl?: string | null;
	size?: number | string;
	className?: string;
	style?: CSSProperties;
	onClick?: () => void;
}

export function Avatar({
	fullName,
	photoUrl,
	size = 40,
	className = "",
	style,
	onClick,
}: Props) {
	if (photoUrl) {
		return (
			<div
				className={`rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-app-surface border border-app-border ${onClick ? "cursor-pointer" : ""} ${className}`}
				style={{ width: size, height: size, ...style }}
				onClick={onClick}
			>
				<img
					src={photoUrl}
					alt={fullName}
					className="w-full h-full object-cover"
				/>
			</div>
		);
	}

	return (
		<div
			className={`flex items-center justify-center rounded-full text-white font-bold select-none border border-app-border ${onClick ? "cursor-pointer" : ""} ${className}`}
			style={{
				width: size,
				height: size,
				fontSize: typeof size === "number" ? size * 0.3 : "0.75rem",
				background:
					"linear-gradient(135deg, var(--color-gradient-from) 0%, var(--color-gradient-to) 100%)",
				flexShrink: 0,
				...style,
			}}
			onClick={onClick}
		>
			{getInitials(fullName)}
		</div>
	);
}
