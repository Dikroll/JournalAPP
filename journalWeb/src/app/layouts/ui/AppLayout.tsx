import { BottomBar } from "@/widgets"
import { Outlet } from "react-router-dom"

export function AppLayout() {
  return (
    <div className="min-h-screen pb-16 text-[#F2F2F2] bg-[#1F2024]">
      <Outlet />
      <BottomBar />
    </div>
  )
}