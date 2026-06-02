import { Megaphone } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNews } from "@/entities/news";
import { EmptyState, SkeletonList } from "@/shared/ui";
import { ErrorView } from "@/shared/ui/ErrorView/ErrorView";
import { NewsCard } from "./NewsCard";

export function NewsTab() {
	const { latest, status } = useNews();
	const navigate = useNavigate();
	const location = useLocation();
	const detailPathPrefix = location.pathname.startsWith("/notifications")
		? "/notifications/news"
		: "/news";

	return (
		<div className="space-y-3 pb-8">
			{status === "loading" && latest.length === 0 && (
				<SkeletonList count={3} height={100} />
			)}

			{status === "error" && latest.length === 0 && (
				<ErrorView message="Не удалось загрузить новости" />
			)}

			{status === "success" && latest.length === 0 && (
				<EmptyState
					icon={<Megaphone size={32} />}
					message="Свежих новостей пока нет. Загляните позже."
				/>
			)}

			<div className="flex flex-col gap-3">
				{latest.map((item) => (
					<NewsCard
						key={item.id}
						item={item}
						onClick={() => navigate(`${detailPathPrefix}/${item.id}`)}
					/>
				))}
			</div>
		</div>
	);
}
