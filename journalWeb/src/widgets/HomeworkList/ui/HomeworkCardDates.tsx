
import { Calendar, Clock } from "lucide-react"

interface Props {
  issuedDate: string
  deadline: string
  isOverdue: boolean
}

export function HomeworkCardDates({ issuedDate, deadline, isOverdue }: Props) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex items-center gap-1.5 text-sm text-[#9CA3AF]">
        <Calendar size={13} />
        <span>{issuedDate}</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm">
        <Clock size={13} className={isOverdue ? "text-[#DC2626]" : "text-[#9CA3AF]"} />
        <span className={isOverdue ? "text-[#DC2626] font-semibold" : "text-[#9CA3AF]"}>
          {deadline}
        </span>
      </div>
    </div>
  )
}