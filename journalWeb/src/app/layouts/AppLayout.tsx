import { BottomBar } from "@/widgets"
import { Outlet } from "react-router-dom"

export function AppLayout() {
  return (
    <div className="min-h-screen pb-16">
      <Outlet />
      <BottomBar />
    </div>
  )
}