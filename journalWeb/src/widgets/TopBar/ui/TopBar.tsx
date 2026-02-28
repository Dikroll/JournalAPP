import { useUserStore } from "@/entities/user/model/store"
import { Link } from "react-router-dom"

export function TopBar() {
  const user = useUserStore((s) => s.user)
  if (!user) return null

  return (
    <div className="bg-zinc-800 flex items-center justify-between px-4 py-3 shadow-lg rounded-2xl mx-4 mt-4">
      <div>
        <h1 className="text-xl font-bold text-white">IT TOP COLLEGE</h1>

        <div className="font-semibold text-zinc-400 text-sm">{user.full_name}</div>
        <div className="text-xs text-zinc-400">{user.group.name}</div>
      </div>
      {user.photo_url && (
        <Link to="/profile">
          <div className="w-[42px] h-[42px] rounded-full flex-shrink-0 overflow-hidden ring-2 ring-gray-700">
            <img
              src={user.photo_url}
              alt={user.full_name}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      )}
    </div>
  )
}