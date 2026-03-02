

import { TopBar } from "@/widgets"
import { Outlet } from "react-router-dom"

export function HomeLayout() {
  return (
    <>
      <TopBar />
      <Outlet />
    </>
  )
}