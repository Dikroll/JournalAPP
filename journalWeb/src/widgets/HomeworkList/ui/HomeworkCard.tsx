import { HomeworkItemWithStatus } from "@/entities/homework/model/useHomeworkGroups"
import { getGradeStyle, STATUS_CONFIG } from "@/entities/schedule/config"
import { AlertCircle, Calendar, Clock, Diamond, Download, MessageSquare, Upload } from "lucide-react"
import { useState } from "react"

interface Props {
  hw: HomeworkItemWithStatus
}

export function HomeworkCard({ hw }: Props) {
  const [showUploadWarning, setShowUploadWarning] = useState(false)

  const config = STATUS_CONFIG[hw.statusKey]
  const StatusIcon = config.icon

  const isChecked  = hw.statusKey === "checked"
  const isReturned = hw.statusKey === "returned"
  const isOverdue  = hw.statusKey === "overdue"

  // ✅ hw.grade — оценка из homework_stud.mark (не путать с hw.status = числовой статус)
  const grade = isChecked ? hw.grade : null
  const gradeStyle = grade != null ? getGradeStyle(grade) : null

  const cardBg = gradeStyle
    ? gradeStyle.bg
    : isOverdue
      ? "bg-[#DC2626]/5"
      : "bg-white/5"

  return (
    <div
      className={`${cardBg} backdrop-blur-xl rounded-[24px] p-5 border-4 border-l-4 border-b-4 ${config.borderColor} border-t-0 border-r-0`}
      style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon size={16} className={config.textColor} />
            <h3 className="text-base font-semibold text-[#F2F2F2]">{hw.spec_name}</h3>
          </div>
          <p className="text-sm text-[#9CA3AF] line-clamp-2">{hw.theme}</p>
        </div>

        {isChecked && grade != null && (
          <div
            className={`ml-3 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border ${gradeStyle!.badge}`}
          >
            {grade}
          </div>
        )}

        {hw.comment && !isReturned && (
          <MessageSquare size={20} className="ml-3 text-[#F29F05] flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-[#9CA3AF] mb-1">
        <Calendar size={14} />
        <span>Выдано: {hw.issued_date}</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm mb-4">
        <Clock
          size={14}
          className={isOverdue ? "text-[#DC2626]" : "text-[#9CA3AF]"}
        />
        <span className={isOverdue ? "text-[#DC2626] font-bold" : "text-[#9CA3AF]"}>
          Срок: {hw.deadline}
        </span>
      </div>

      {isReturned && hw.comment && (
        <div className="mb-4 p-3 bg-[#6B7280]/10 border border-[#6B7280]/30 rounded-2xl">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-[#6B7280] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#F2F2F2]">{hw.comment}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isChecked && !isReturned && (
          <>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-2xl text-[#F2F2F2] text-sm font-medium border border-white/20 transition-colors">
              <Upload size={16} />
              <span>Загрузить</span>
            </button>
            <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[#F2F2F2] border border-white/10 transition-colors">
              <Download size={16} />
            </button>
          </>
        )}

        {isReturned && (
          <>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#DC2626] hover:bg-[#DC2626]/90 rounded-2xl text-white text-sm font-medium transition-colors">
              <Upload size={16} />
              <span>Загрузить заново</span>
            </button>
            <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[#F2F2F2] border border-white/10 transition-colors">
              <Download size={16} />
            </button>
          </>
        )}

        {isChecked && (
          <>
            <button
              onClick={() => setShowUploadWarning(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-2xl text-[#F2F2F2] text-sm font-medium border border-white/20 transition-colors"
            >
              <Upload size={16} />
              <span>Загрузить заново</span>
            </button>
            <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[#F2F2F2] border border-white/10 transition-colors">
              <Download size={16} />
            </button>
          </>
        )}
      </div>

      {showUploadWarning && (
        <div className="mt-3 p-3 bg-[#F29F05]/10 border border-[#F29F05]/30 rounded-2xl">
          <div className="flex items-start gap-2 mb-3">
            <Diamond size={16} className="text-[#F29F05] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#F2F2F2]">
              Повторная загрузка спишет{" "}
              <span className="font-bold text-[#F29F05]">2 💎</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUploadWarning(false)}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[#F2F2F2] text-sm transition-colors"
            >
              Отмена
            </button>
            <button className="flex-1 px-4 py-2 bg-[#F29F05] hover:bg-[#F29F05]/90 rounded-xl text-white text-sm font-medium transition-colors">
              Продолжить
            </button>
          </div>
        </div>
      )}
    </div>
  )
}