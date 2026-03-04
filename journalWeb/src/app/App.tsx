import { useInitUser } from "@/features/initUser/hooks/useInitUser"
import { AppRouter } from "./router"

export function App() {
  useInitUser()
  return <AppRouter />
}