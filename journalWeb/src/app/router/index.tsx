import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "@/features/auth";
import { useHydrationStore } from "@/shared/model/authStore";
import { pageConfig } from "@/shared/config";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { ScrollToTop } from "@/shared/lib";
import { FullscreenLoader } from "@/widgets/Loading/ui/Loader";
import { AppLayout as MobileLayout } from "../layouts";
import { WebLayout } from "../layouts/ui/WebLayout";

const EvaluateLessonPage = lazy(() =>
	import("@/pages/evaluateLesson/ui/EvaluateLessonPage").then((m) => ({
		default: m.EvaluateLessonPage,
	})),
);
const GoalDetailPage = lazy(() =>
	import("@/pages/goals/ui/GoalDetailPage").then((m) => ({
		default: m.GoalDetailPage,
	})),
);
const GoalsPage = lazy(() =>
	import("@/pages/goals/ui/GoalsPage").then((m) => ({ default: m.GoalsPage })),
);
const GradesPage = lazy(() =>
	import("@/pages/grades/ui/GradesPage").then((m) => ({ default: m.GradesPage })),
);
const HomePage = lazy(() =>
	import("@/pages/home/ui/HomePage").then((m) => ({ default: m.HomePage })),
);
const HomeworkPage = lazy(() =>
	import("@/pages/homework/ui/HomeworkPage").then((m) => ({
		default: m.HomeworkPage,
	})),
);
const LibraryPage = lazy(() =>
	import("@/pages/library/ui/LibraryPage").then((m) => ({
		default: m.LibraryPage,
	})),
);
const LoginPage = lazy(() =>
	import("@/pages/login/ui/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const MarketPage = lazy(() =>
	import("@/pages/market/ui/MarketPage").then((m) => ({ default: m.MarketPage })),
);
const NewsDetailPage = lazy(() =>
	import("@/pages/notifications/ui/NewsDetailPage").then((m) => ({
		default: m.NewsDetailPage,
	})),
);
const NewsPage = lazy(() =>
	import("@/pages/Newspage/ui/Newspage").then((m) => ({ default: m.NewsPage })),
);
const NotificationSettingsPage = lazy(() =>
	import("@/pages/notificationSettings/ui/NotificationSettingsPage").then(
		(m) => ({ default: m.NotificationSettingsPage }),
	),
);
const NotificationsPage = lazy(() =>
	import("@/pages/notifications/ui/NotificationsPage").then((m) => ({
		default: m.NotificationsPage,
	})),
);
const PaymentPage = lazy(() =>
	import("@/pages/payment/ui/PaymentPage").then((m) => ({
		default: m.PaymentPage,
	})),
);
const ProfileActivityPage = lazy(() =>
	import("@/pages/profileActivity/ui/ProfileActivityPage").then((m) => ({
		default: m.ProfileActivityPage,
	})),
);
const ProfileDetailsPage = lazy(() =>
	import("@/pages/profileDetail/ui/ProfileDetailPage").then((m) => ({
		default: m.ProfileDetailsPage,
	})),
);
const ProfilePage = lazy(() =>
	import("@/pages/profile/ui/ProfilePage").then((m) => ({
		default: m.ProfilePage,
	})),
);
const SchedulePage = lazy(() =>
	import("@/pages/schedule/ui/SchedulePage").then((m) => ({
		default: m.SchedulePage,
	})),
);

function RootLayout() {
	const isDesktop = useIsDesktop();
	return isDesktop ? <WebLayout /> : <MobileLayout />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const hasHydrated = useHydrationStore((s) => s.hasHydrated);

	if (!hasHydrated) return <FullscreenLoader />;

	return isAuthenticated ? (
		children
	) : (
		<Navigate to={pageConfig.login} replace />
	);
}

function PublicRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const hasHydrated = useHydrationStore((s) => s.hasHydrated);

	if (!hasHydrated) {
		return (
			<div
				style={{
					minHeight: "100dvh",
					backgroundColor: "var(--color-bg, #1F2024)",
				}}
			/>
		);
	}

	const searchParams = new URLSearchParams(
		window.location.hash.split("?")[1] ?? "",
	);
	const isAddingAccount = searchParams.get("addAccount") === "true";

	if (isAuthenticated && !isAddingAccount) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}

const Suspended = ({ children }: { children: React.ReactNode }) => (
	<Suspense fallback={<FullscreenLoader />}>
		{children}
	</Suspense>
);

export function AppRouter() {
	return (
		<HashRouter>
			<ScrollToTop />
			<Suspense fallback={<FullscreenLoader />}>
				<Routes>
					<Route
						path={pageConfig.login}
						element={
							<PublicRoute>
								<Suspended>
									<LoginPage />
								</Suspended>
							</PublicRoute>
						}
					/>

					<Route
						path="/"
						element={
							<ProtectedRoute>
								<RootLayout />
							</ProtectedRoute>
						}
					>
						<Route index element={<Suspended><HomePage /></Suspended>} />
						<Route path="schedule" element={<Suspended><SchedulePage /></Suspended>} />
						<Route path="homework" element={<Suspended><HomeworkPage /></Suspended>} />
						<Route path="library" element={<Suspended><LibraryPage /></Suspended>} />
						<Route path="grades" element={<Suspended><GradesPage /></Suspended>} />
						<Route path="goals" element={<Suspended><GoalsPage /></Suspended>} />
						<Route path="goals/:specId" element={<Suspended><GoalDetailPage /></Suspended>} />
						<Route path="profile" element={<Suspended><ProfilePage /></Suspended>} />
						<Route path="profile/details" element={<Suspended><ProfileDetailsPage /></Suspended>} />
						<Route path="profile/activity" element={<Suspended><ProfileActivityPage /></Suspended>} />
						<Route
							path="profile/notification-settings"
							element={<Suspended><NotificationSettingsPage /></Suspended>}
						/>
						<Route path="market" element={<Suspended><MarketPage /></Suspended>} />
						<Route path="payment" element={<Suspended><PaymentPage /></Suspended>} />
						<Route path="notifications" element={<Suspended><NotificationsPage /></Suspended>} />
						<Route path="notifications/news/:id" element={<Suspended><NewsDetailPage /></Suspended>} />
						<Route path="evaluate-lesson" element={<Suspended><EvaluateLessonPage /></Suspended>} />
						<Route path="news" element={<Suspended><NewsPage /></Suspended>} />
					</Route>

					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
		</HashRouter>
	);
}
