import { userApi } from "@/entities/user/api"
import { useUserStore } from "@/entities/user/model/store"
import { useEffect } from "react"

export function useUser() {
  const { user, setUser } = useUserStore()

  useEffect(() => {
    if (user) return
    userApi.getMe().then(setUser).catch(() => {})
  }, [])

  return user
}