
import type { HomeworkStatus } from "@/entities/homework/hooks/useHomeworkGroups"
import { useDownloadHomework } from "@/features/downloadHomework/hooks/useDownloadHomework"
import { useSendHomework } from "@/features/sendHomework/hooks/useSendHomework"
import { Download, ExternalLink, Upload } from "lucide-react"

interface Props {
  homeworkId: number
  statusKey: HomeworkStatus
  fileUrl: string | null
  studAnswer: string | null
  onUploadChecked: () => void 
}

export function HomeworkCardActions({
  homeworkId,
  statusKey,
  fileUrl,
  studAnswer,
  onUploadChecked,
}: Props) {
  const { downloadTask, viewAnswer } = useDownloadHomework()
  const { upload } = useSendHomework(homeworkId)

  const isChecked = statusKey === "checked"
  const isReturned = statusKey === "returned"

  const DownloadBtn = (
    <button
		type='button'
      onClick={() => downloadTask(fileUrl)}
      disabled={!fileUrl}
      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl text-[#F2F2F2] border border-white/10 transition-colors"
      title="Скачать задание"
    >
      <Download size={16} />
    </button>
  )

  if (!isChecked && !isReturned) {
    return (
      <div className="flex items-center gap-2">
        <button
				type='button'
          onClick={upload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-2xl text-[#F2F2F2] text-sm font-medium border border-white/20 transition-colors"
        >
          <Upload size={16} />
          <span>Загрузить</span>
        </button>
        {DownloadBtn}
      </div>
    )
  }

  if (isReturned) {
    return (
      <div className="flex items-center gap-2">
        <button
				type='button'
          onClick={upload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#DC2626] hover:bg-[#DC2626]/90 rounded-2xl text-white text-sm font-medium transition-colors"
        >
          <Upload size={16} />
          <span>Загрузить заново</span>
        </button>
        {DownloadBtn}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
			type='button'
        onClick={onUploadChecked}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-2xl text-[#F2F2F2] text-sm font-medium border border-white/20 transition-colors"
      >
        <Upload size={16} />
        <span>Загрузить заново</span>
      </button>

      {studAnswer ? (
        <button
				type='button'
          onClick={() => viewAnswer(studAnswer)}
          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[#10B981] border border-[#10B981]/20 transition-colors"
          title="Посмотреть мой ответ"
        >
          <ExternalLink size={16} />
        </button>
      ) : (
        DownloadBtn
      )}
    </div>
  )
}