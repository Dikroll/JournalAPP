import type { HomeworkStatus } from "@/entities/homework/hooks/useHomeworkGroups"
import { useDownloadHomework } from "@/features/downloadHomework/hooks/useDownloadHomework"
import { SendHomeworkSheet } from "@/features/sendHomework/ui/SendHomeworkSheet"
import { Download, ExternalLink, Upload } from "lucide-react"
import { useState } from "react"

interface Props {
  homeworkId: number
  homeworkTheme: string
  statusKey: HomeworkStatus
  fileUrl: string | null
  studAnswer: string | null
  onUploadChecked: () => void
}

export function HomeworkCardActions({
  homeworkId,
  homeworkTheme,
  statusKey,
  fileUrl,
  studAnswer,
  onUploadChecked,
}: Props) {
  const { downloadTask, viewAnswer } = useDownloadHomework()
  const [sheetOpen, setSheetOpen] = useState(false)

  const isChecked = statusKey === "checked"
  const isReturned = statusKey === "returned"

  const DownloadBtn = (
    <button
      type="button"
      onClick={() => downloadTask(fileUrl)}
      disabled={!fileUrl}
      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl text-[#F2F2F2] border border-white/10 transition-colors"
      title="Скачать задание"
    >
      <Download size={16} />
    </button>
  )

  const UploadBtn = ({ label, red }: { label: string; red?: boolean }) => (
    <button
      type="button"
      onClick={() => isChecked ? onUploadChecked() : setSheetOpen(true)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
        red
          ? "bg-[#DC2626] hover:bg-[#DC2626]/90 text-white"
          : "bg-white/10 hover:bg-white/15 text-[#F2F2F2] border border-white/20"
      }`}
    >
      <Upload size={16} />
      <span>{label}</span>
    </button>
  )

  return (
    <>
      <div className="flex items-center gap-2">
        {isChecked ? (
          <>
            <UploadBtn label="Загрузить заново" />
            {studAnswer ? (
              <button
                type="button"
                onClick={() => viewAnswer(studAnswer)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[#10B981] border border-[#10B981]/20 transition-colors"
                title="Посмотреть мой ответ"
              >
                <ExternalLink size={16} />
              </button>
            ) : DownloadBtn}
          </>
        ) : isReturned ? (
          <>
            <UploadBtn label="Загрузить заново" red />
            {DownloadBtn}
          </>
        ) : (
          <>
            <UploadBtn label="Загрузить" />
            {DownloadBtn}
          </>
        )}
      </div>

      {sheetOpen && (
        <SendHomeworkSheet
          homeworkId={homeworkId}
          homeworkTheme={homeworkTheme}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  )
}