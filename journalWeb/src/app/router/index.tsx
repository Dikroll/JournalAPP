import { useAuthStore } from "@/features/auth/model/store"
import { HomePage, LoginPage, SchedulePage } from "@/pages"
import { pageConfig } from "@/shared/config/pageConfig"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	return isAuthenticated ? <>{children}</> : <Navigate to={pageConfig.login} replace />;
}

export function AppRouter() {
	return (
		<HashRouter>
			<Routes>
				<Route path={pageConfig.login} element={<LoginPage />} />
      <Route path={pageConfig.home} element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path={pageConfig.schedule} element={
        <ProtectedRoute>
          <SchedulePage />
        </ProtectedRoute>
      } />
				<Route path="*" element={<Navigate to={pageConfig.home} replace />} />
			</Routes>
		</HashRouter>
	);
}
