import { useAuthStore } from "@/features/auth/model/store"
import { HomePage, LoginPage, SchedulePage } from "@/pages"
import { pageConfig } from "@/shared/config/pageConfig"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "../layouts/AppLayout"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	return isAuthenticated ? children : <Navigate to={pageConfig.login} replace />
}

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path={pageConfig.login} element={<LoginPage />} />
        
        {/* Все защищённые страницы внутри AppLayout */}
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path={pageConfig.home} element={<HomePage />} />
          <Route path={pageConfig.schedule} element={<SchedulePage />} />
          {/* profile сюда НЕ добавляем — у него нет BottomBar */}
        </Route>

        {/* profile — отдельно, без BottomBar */}
        <Route path={pageConfig.profile} element={
          <ProtectedRoute>
            <div>kfkfkkf</div>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={pageConfig.home} replace />} />
      </Routes>
    </HashRouter>
  )
}