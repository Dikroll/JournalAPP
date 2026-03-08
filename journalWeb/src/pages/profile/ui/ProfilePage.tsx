import { useLeaderboardStore } from "@/entities/leaderboard/model/store"
import { useUser } from "@/entities/user/hooks/useUser"
import { pageConfig } from "@/shared/config/pageConfig"
import { Leaderboard, ProfileHeader, ReviewsList } from "@/widgets"
import { ShoppingBag } from "lucide-react"
import { Link } from "react-router-dom"

export function ProfilePage() {
  const user = useUser()
  const myRank = useLeaderboardStore((s) => s.group.data?.my_rank?.group)

  if (!user) {
    return (
      <div className="px-4 pt-4 space-y-3">
        <div className="bg-white/5 rounded-[28px] h-48 animate-pulse border border-white/10" />
        <div className="bg-white/5 rounded-[24px] h-24 animate-pulse border border-white/10" />
      </div>
    )
  }

  return (
    <div className="pb-24">
      <ProfileHeader user={user} rank={myRank?.position} />

      <div className="px-4 space-y-5">
        {user.is_debtor && (
          <div
            className="bg-[#EF4444]/10 rounded-[20px] p-4 border border-[#EF4444]/20 flex items-center justify-between"
            style={{ boxShadow: "0 4px 16px 0 rgba(239,68,68,0.1)" }}
          >
            <div>
              <p className="text-xs text-[#9CA3AF] mb-0.5">Статус оплаты</p>
              <p className="text-sm font-semibold text-[#EF4444]">Есть задолженность</p>
            </div>
            <Link
              to={pageConfig.payment}
              className="px-4 py-2 rounded-[14px] bg-white/10 border border-white/10 text-sm text-[#F2F2F2] font-medium"
            >
              История
            </Link>
          </div>
        )}

        <Leaderboard myStudentId={user.student_id} />

        <ReviewsList />

        <Link
          to={pageConfig.market}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-[24px] border border-[#F29F05]/30 bg-[#F29F05]/10 text-[#F29F05] font-semibold text-sm transition-colors hover:bg-[#F29F05]/20"
        >
          <ShoppingBag size={18} />
          Открыть магазин
        </Link>

        <button className="w-full py-4 rounded-[24px] border border-[#F20519]/30 bg-[#F20519]/10 text-[#F20519] font-semibold text-sm transition-colors hover:bg-[#F20519]/20">
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}