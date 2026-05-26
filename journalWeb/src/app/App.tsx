import { Suspense, lazy } from "react";
import { useFeedback } from "@/entities/feedback";
import { useInitUser } from "@/features/initUser/hooks/useInitUser";
import { useQueueProcessor } from "@/features/offlineQueue";
import { isNativePlatform } from "@/shared/lib/platform";
import { AppRouter } from "./router";

// Мобильные фичи загружаются лениво и только на нативной платформе.
// При сборке с VITE_PLATFORM=web условие false → Vite вырезает
// весь import("./MobileFeatures") из бандла (dead code elimination).
const MobileFeatures = isNativePlatform
	? lazy(() => import("./MobileFeatures"))
	: () => null;

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
