import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/store";
import { LoginPage } from "@/pages/login/ui/LoginPage";
import { SchedulePage } from "@/pages/schedule/ui/SchedulePage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export function AppRouter() {
	return (
		<HashRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<SchedulePage />
						</ProtectedRoute>
					}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</HashRouter>
	);
}
