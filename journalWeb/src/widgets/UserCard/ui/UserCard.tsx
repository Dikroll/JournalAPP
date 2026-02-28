import { useUserStore } from "@/entities/user/model/store"

export function UserCard() {
  const user = useUserStore((s) => s.user)
  if (!user) return null

  return (
    <div className="bg-gray-200">
        <div className="bg-gray-200 flex items-center justify-end gap-4 px-4 py-1">
        <span className="text-xs text-gray-600">💎 {user.points.diamonds.earned}</span>
        <span className="text-xs text-gray-600">🪙 {user.points.coins.earned}</span>
      </div>
        <div>

          <div className="font-medium text-sm">{user.full_name}</div>
          <div className="text-xs text-gray-500">{user.group.name}</div>
        </div>
      </div>
  )
}