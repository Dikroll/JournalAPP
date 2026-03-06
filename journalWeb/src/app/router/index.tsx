import { useAuthStore } from "@/features/auth/model/store"
import { GradesPage, HomePage, HomeworkPage, LoginPage, SchedulePage } from "@/pages"
import { pageConfig } from "@/shared/config/pageConfig"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout, HomeLayout } from "../layouts"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : (
    <Navigate to={pageConfig.login} replace />
  )
}

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path={pageConfig.login} element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
         <Route element={<HomeLayout />}>
            <Route index element={<HomePage />} />
          </Route>

          <Route path="schedule" element={<SchedulePage />} />
          <Route path="homework" element={<HomeworkPage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="profile" element={<div>kfkfkkf</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}