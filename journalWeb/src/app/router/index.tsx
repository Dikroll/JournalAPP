import { Suspense } from "react";
import {
	BrowserRouter,
	HashRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from "react-router-dom";
import { useAuthStore } from "@/features/auth";
import { pageConfig } from "@/shared/config";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { ScrollToTop } from "@/shared/lib";
import { isNativeRuntime } from "@/shared/lib/platform";
import { useHydrationStore } from "@/shared/model/authStore";
import { ErrorBoundary } from "@/shared/ui";
import { FullscreenLoader } from "@/widgets/Loading/ui/Loader";
import { AppLayout as MobileLayout, WebLayout } from "../layouts";
import * as Pages from "./lazyPages";

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
	const location = useLocation();

	if (!hasHydrated) return <FullscreenLoader />;

	const searchParams = new URLSearchParams(location.search);
	const isAddingAccount = searchParams.get("addAccount") === "true";

	if (isAuthenticated && !isAddingAccount) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}

function MobileOnlyRoute({
	children,
	fallback = pageConfig.news,
}: {
	children: React.ReactNode;
	fallback?: string;
}) {
	const isDesktop = useIsDesktop();

	return isDesktop ? <Navigate to={fallback} replace /> : <>{children}</>;
}

const Suspended = ({ children }: { children: React.ReactNode }) => (
	<Suspense fallback={<FullscreenLoader />}>{children}</Suspense>
);

function AppRoutes() {
	const location = useLocation();

	return (
		<ErrorBoundary key={location.key} fallback={<FullscreenLoader />}>
			<ScrollToTop />
			<Suspense fallback={<FullscreenLoader />}>
				<Routes>
					<Route
						path={pageConfig.login}
						element={
							<PublicRoute>
								<Suspended>
									<Pages.LoginPage />
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
						<Route
							index
							element={
								<Suspended>
									<Pages.HomePage />
								</Suspended>
							}
						/>
						<Route
							path="schedule"
							element={
								<Suspended>
									<Pages.SchedulePage />
								</Suspended>
							}
						/>
						<Route
							path="homework"
							element={
								<Suspended>
									<Pages.HomeworkPage />
								</Suspended>
							}
						/>
						<Route
							path="library"
							element={
								<Suspended>
									<Pages.LibraryPage />
								</Suspended>
							}
						/>
						<Route
							path="grades"
							element={
								<Suspended>
									<Pages.GradesPage />
								</Suspended>
							}
						/>
						<Route
							path="goals"
							element={
								<Suspended>
									<Pages.GoalsPage />
								</Suspended>
							}
						/>
						<Route
							path="goals/:specId"
							element={
								<Suspended>
									<Pages.GoalDetailPage />
								</Suspended>
							}
						/>
						<Route
							path="profile"
							element={
								<Suspended>
									<Pages.ProfilePage />
								</Suspended>
							}
						/>
						<Route
							path="profile/details"
							element={
								<MobileOnlyRoute fallback={pageConfig.profile}>
									<Suspended>
										<Pages.ProfileDetailsPage />
									</Suspended>
								</MobileOnlyRoute>
							}
						/>
						<Route
							path="profile/activity"
							element={
								<Suspended>
									<Pages.ProfileActivityPage />
								</Suspended>
							}
						/>
						<Route
							path="profile/notification-settings"
							element={
								<MobileOnlyRoute fallback={pageConfig.profile}>
									<Suspended>
										<Pages.NotificationSettingsPage />
									</Suspended>
								</MobileOnlyRoute>
							}
						/>
						<Route
							path="market"
							element={
								<Suspended>
									<Pages.MarketPage />
								</Suspended>
							}
						/>
						<Route
							path="payment"
							element={
								<Suspended>
									<Pages.PaymentPage />
								</Suspended>
							}
						/>
						<Route
							path="notifications"
							element={
								<MobileOnlyRoute>
									<Suspended>
										<Pages.NotificationsPage />
									</Suspended>
								</MobileOnlyRoute>
							}
						/>
						<Route
							path="notifications/news/:id"
							element={
								<MobileOnlyRoute>
									<Suspended>
										<Pages.NewsDetailPage />
									</Suspended>
								</MobileOnlyRoute>
							}
						/>
						<Route
							path="evaluate-lesson"
							element={
								<Suspended>
									<Pages.EvaluateLessonPage />
								</Suspended>
							}
						/>
						<Route
							path="news"
							element={
								<Suspended>
									<Pages.NewsPage />
								</Suspended>
							}
						/>
						<Route
							path="news/:id"
							element={
								<Suspended>
									<Pages.NewsDetailPage />
								</Suspended>
							}
						/>
					</Route>

					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
		</ErrorBoundary>
	);
}

function normalizeWebHashUrl() {
	if (isNativeRuntime) return;
	if (!window.location.hash.startsWith("#/")) return;

	const hashRoute = window.location.hash.slice(1);
	const search = hashRoute.includes("?") ? "" : window.location.search;
	window.history.replaceState(null, "", `${hashRoute}${search}`);
}

export function AppRouter() {
	normalizeWebHashUrl();
	const Router = isNativeRuntime ? HashRouter : BrowserRouter;

	return (
		<Router>
			<AppRoutes />
		</Router>
	);
}
