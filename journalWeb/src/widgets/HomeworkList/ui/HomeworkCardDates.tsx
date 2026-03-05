import { Calendar, Clock } from "lucide-react"

interface Props {
  issuedDate: string
  deadline: string
  isOverdue: boolean
  isNew?: boolean
}

function getDaysUntilDeadline(deadline: string): number | null {
  try {
    const deadlineDate = new Date(deadline)
    if (isNaN(deadlineDate.getTime())) return null
    const now = new Date()
    const diffMs = deadlineDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}

export function HomeworkCardDates({ issuedDate, deadline, isOverdue, isNew }: Props) {
  const daysLeft = (isNew && !isOverdue) ? getDaysUntilDeadline(deadline) : null
  const isUrgentYellow = daysLeft != null && daysLeft <= 1 && daysLeft > 0
  const isUrgentRed = daysLeft === 0
  const isUrgent = isUrgentYellow || isUrgentRed

  return (
    <div className="flex gap-4 mb-4">
      <div className="flex items-center gap-1.5 text-sm text-[#9CA3AF]">
        <Calendar size={13} />
        <span>{issuedDate}</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm">
        <Clock
          size={13}
          className={
            isOverdue ? "text-[#DC2626]"
            : isUrgentRed ? "text-[#DC2626]"
            : isUrgentYellow ? "text-[#F59E0B]"
            : "text-[#9CA3AF]"
          }
        />
        <span
          className={
            isOverdue
              ? "text-[#DC2626] font-semibold"
              : isUrgentRed
                ? "text-[#DC2626] font-semibold drop-shadow-[0_0_6px_rgba(220,38,38,0.6)]"
                : isUrgentYellow
                  ? "text-[#F59E0B] font-semibold drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
                  : "text-[#9CA3AF]"
          }
        >
          {deadline}
        </span>
        {isUrgent && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            isUrgentRed
              ? "bg-[#DC2626]/15 text-[#DC2626]"
              : "bg-[#F59E0B]/15 text-[#F59E0B]"
          }`}>
            {daysLeft === 0 ? "сегодня" : "завтра"}
          </span>
        )}
      </div>
    </div>
  )
} 