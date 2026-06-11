import { ChevronRight, Megaphone } from "lucide-react";
import { memo } from "react";
import type { NewsItem } from "@/entities/news";

interface NewsCardProps {
	item: NewsItem;
	onClick: () => void;
}

export const NewsCard = memo(function NewsCard({
	item,
	onClick,
}: NewsCardProps) {
	const formattedDate = new Date(item.published_at).toLocaleDateString(
		"ru-RU",
		{
			day: "numeric",
			month: "long",
			hour: "2-digit",
			minute: "2-digit",
		},
	);

	return (
		<div
			onClick={onClick}
			className="group cursor-pointer w-full text-left outline-none block"
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
		>
			<div
				className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 transition-all duration-300 ease-out border border-app-border
				${
					!item.is_read
						? "bg-app-surface"
						: "bg-app-surface/60 opacity-70 hover:opacity-100 hover:bg-app-surface"
				}
			`}
			>
				<div className="relative flex gap-4 items-center sm:items-start">
					{/* Icon Container */}
					<div className="flex-shrink-0">
						<div
							className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-transform duration-300
							${
								!item.is_read
									? "bg-app-surface-strong text-app-text border border-app-border"
									: "bg-app-surface-strong/50 text-app-muted border border-app-border/30"
							}
						`}
						>
							<Megaphone size={20} strokeWidth={!item.is_read ? 2 : 1.5} />
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0 pr-2 sm:pr-8 flex flex-col justify-center sm:pt-0.5">
						<div className="flex items-start gap-3">
							<h3
								className={`text-[15px] sm:text-[16px] leading-[1.3] mb-1.5 transition-colors duration-300
								${!item.is_read ? "font-bold text-app-text" : "font-medium text-app-text"}
							`}
								style={{
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
								}}
							>
								{item.title}
							</h3>

							{/* Minimalistic unread dot */}
							{!item.is_read && (
								<div className="flex-shrink-0 mt-2">
									<div className="w-2 h-2 rounded-full bg-brand" />
								</div>
							)}
						</div>

						<p
							className={`text-[13px] tracking-wide transition-colors duration-300
							${!item.is_read ? "text-app-muted" : "text-app-faint"}
						`}
						>
							{formattedDate}
						</p>
					</div>

					{/* Hover Arrow */}
					<div
						className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 hidden sm:flex
						${!item.is_read ? "text-brand opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0" : "text-app-muted/30 opacity-0 group-hover:opacity-100"}
					`}
					>
						<ChevronRight size={20} strokeWidth={2} />
					</div>
				</div>
			</div>
		</div>
	);
});
