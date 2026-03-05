
import { AlertCircle } from "lucide-react"

interface Props {
  comment: string
}

export function HomeworkCardReturnedComment({ comment }: Props) {
  return (
    <div className="mb-4 p-3 bg-[#6B7280]/10 border border-[#6B7280]/30 rounded-2xl">
      <div className="flex items-start gap-2">
        <AlertCircle size={15} className="text-[#6B7280] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#F2F2F2]">{comment}</p>
      </div>
    </div>
  )
}