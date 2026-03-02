import { useAuthStore } from "@/features/auth/model/store"
import { HomePage, LoginPage, SchedulePage } from "@/pages"
import { pageConfig } from "@/shared/config/pageConfig"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "../layouts/AppLayout"
import { HomeLayout } from "../layouts/HomeLayout"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to={pageConfig.login} replace />
}

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path={pageConfig.login} element={<LoginPage />} />

        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route element={<HomeLayout />}>
            <Route path={pageConfig.home} element={<HomePage />} />
          </Route>
          <Route path={pageConfig.schedule} element={<SchedulePage />} />
        </Route>

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