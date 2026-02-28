import { userApi } from "@/entities/user/api"
import { useUserStore } from "@/entities/user/model/store"
import type { UserInfo } from "@/entities/user/model/types"
import { useAuthStore } from "@/features/auth/model/store"
import { ttl } from "@/shared/config/cache"
import { CACHE_KEYS, storage } from "@/shared/lib/storage"
import { useEffect } from "react"
import { AppRouter } from "./router"

export function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useUserStore((s) => s.user)
  const setUser = useUserStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!isAuthenticated) return

    const cached = storage.getStale(CACHE_KEYS.USER_ME)
    if (cached && !user) setUser(cached as UserInfo)

    if (!storage.get(CACHE_KEYS.USER_ME)) {
      userApi.getMe()
        .then((data) => {
          setUser(data)
          storage.set(CACHE_KEYS.USER_ME, data, ttl.USER_INFO)
        })
        .catch(() => logout())
    }
  }, [isAuthenticated, user, setUser, logout])

  return <AppRouter />
}