import { useUserStore } from "@/entities/user/model/store"

export function UserCard() {
  const user = useUserStore((s) => s.user)
  if (!user) return null

  return (
    <div className="flex items-center gap-3 p-4 border-b">
      {user.photo_url && (
        <img
          src={user.photo_url}
          alt={user.full_name}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}
      <div>
        <div className="font-medium text-sm">{user.full_name}</div>
        <div className="text-xs text-gray-500">{user.group.name}</div>
      </div>
      <div className="ml-auto text-xs text-gray-400">
         {user.points.diamonds.earned} · {user.points.coins.earned}
      </div>
    </div>
  )
}