import { lazy, Suspense } from "react";
import { useFeedback } from "@/entities/feedback";
import { useInitUser } from "@/features/initUser/hooks/useInitUser";
import { useQueueProcessor } from "@/features/offlineQueue";
import { AppRouter } from "./router";

// Мобильные фичи загружаются лениво и только на нативной платформе.
// При сборке с VITE_PLATFORM=web условие false → Vite вырезает
// весь import("./MobileFeatures") из бандла (dead code elimination).
const MobileFeatures =
	import.meta.env.VITE_PLATFORM === "web"
		? () => null
		: lazy(() => import("./MobileFeatures"));

export function App() {
	useInitUser();
	useQueueProcessor();
	useFeedback();

	return (
		<>
			<AppRouter />
			<Suspense>
				<MobileFeatures />
			</Suspense>
		</>
	);
}
