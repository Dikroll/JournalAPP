import { getGradeStyle, STATUS_CONFIG } from "@/entities/homework/config"
import type { HomeworkItemWithStatus } from "@/entities/homework/hooks/useHomeworkGroups"
import { useState } from "react"
import { HomeworkCardActions } from "./HomeworkCardActions"
import { HomeworkCardDates } from "./HomeworkCardDates"
import { HomeworkCardHeader } from "./HomeworkCardHeader"
import { HomeworkCardReturnedComment } from "./HomeworkCardReturnedComment"
import { HomeworkCardUploadWarning } from "./HomeworkCardUploadWarning"


interface Props {
  hw: HomeworkItemWithStatus
}

export function HomeworkCard({ hw }: Props) {
  const [showUploadWarning, setShowUploadWarning] = useState(false)

  const config = STATUS_CONFIG[hw.statusKey]
  const isChecked = hw.statusKey === "checked"
  const isReturned = hw.statusKey === "returned"
  const isOverdue = hw.statusKey === "overdue"

  const grade = isChecked ? hw.grade : null
  const gradeStyle = grade != null ? getGradeStyle(grade) : null

  const cardBg = gradeStyle
    ? gradeStyle.bg
    : isOverdue
      ? "bg-[#DC2626]/5"
      : "bg-white/5"

  const handleConfirmReupload = () => {
    setShowUploadWarning(false)
    // TODO: вызвать useSendHomework.upload() когда будет реализовано
  }

  return (
    <div
      className={`${cardBg} backdrop-blur-xl rounded-[24px] p-5 border-4 border-l-4 border-b-4 ${config.borderColor} border-t-0 border-r-0`}
      style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)" }}
    >
      <HomeworkCardHeader hw={hw} gradeStyle={gradeStyle} grade={grade} />

      <HomeworkCardDates
        issuedDate={hw.issued_date}
        deadline={hw.deadline}
        isOverdue={isOverdue}
      />

      {isReturned && hw.comment && (
        <HomeworkCardReturnedComment comment={hw.comment} />
      )}

      <HomeworkCardActions
        homeworkId={hw.id}
        statusKey={hw.statusKey}
        fileUrl={hw.file_url}
        studAnswer={hw.stud_answer}
        onUploadChecked={() => setShowUploadWarning(true)}
      />

      {showUploadWarning && (
        <HomeworkCardUploadWarning
          onCancel={() => setShowUploadWarning(false)}
          onConfirm={handleConfirmReupload}
        />
      )}
    </div>
  )
}