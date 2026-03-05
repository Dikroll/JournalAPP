import { useUserStore } from "@/entities/user/model/store"
import { pageConfig } from "@/shared/config/pageConfig"
import { getAvatarUrl } from "@/shared/lib/avatarCache"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export function TopBar() {
  const fullName  = useUserStore((s) => s.user?.full_name)
  const groupName = useUserStore((s) => s.user?.group.name)
  const photoUrl  = useUserStore((s) => s.user?.photo_url)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!photoUrl) return
    getAvatarUrl(photoUrl).then(setAvatarUrl)
  }, [photoUrl])

  if (!fullName) return null

  return (
    <div className="px-4 pt-4 pb-2">
      <div
        className="bg-white/5 backdrop-blur-xl rounded-[24px] px-5 py-4 border border-white/10"
        style={{ boxShadow: "0 4px 24px 0 rgba(0, 0, 0, 0.3)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-base font-semibold text-[#F2F2F2] mb-0.5">
              IT TOP COLLEGE
            </h1>
            <p className="text-sm text-[#9CA3AF] mb-0.5">{fullName}</p>
            <p className="text-xs text-[#9CA3AF]">{groupName}</p>
          </div>

          {avatarUrl && (
            <Link to={pageConfig.profile}>
              <div className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-[#F20519]/50">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}