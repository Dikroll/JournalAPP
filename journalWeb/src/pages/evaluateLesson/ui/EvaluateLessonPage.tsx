import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSwipeBack } from "@/shared/hooks/useSwipeBack";
import { IconButton, PageHeader } from "@/shared/ui";
import { pageConfig, PAGE_TITLES } from "@/shared/config";
import { EvaluateLessonList } from "@/widgets";

export function EvaluateLessonPage() {
	const navigate = useNavigate();

	useSwipeBack();

	return (
		<div className="min-h-screen text-app-text pb-28">
			<div className="p-4 space-y-4">
				<div className="flex items-center gap-2">
					<IconButton
						icon={<ArrowLeft size={18} />}
						onClick={() => navigate(-1)}
						size="md"
						shape="square"
						variant="surface"
						style={{ boxShadow: "var(--shadow-card)" }}
						aria-label="Назад"
					/>
					<div className="flex-1">
						<PageHeader title={PAGE_TITLES[pageConfig.evaluateLesson]} />
					</div>
				</div>
			</div>

			<div className="px-4">
				<EvaluateLessonList />
			</div>
		</div>
	);
}
