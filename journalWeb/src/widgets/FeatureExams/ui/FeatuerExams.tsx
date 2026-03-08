import { useFutureExams } from "@/entities/exam/hooks/useFutureExam"
import { CalendarDays } from "lucide-react"

export function FutureExams() {
  const { exams, status } = useFutureExams()

  if (status === "loading" && exams.length === 0)
    return <p className="text-gray-500 text-sm">Загрузка...</p>

  if (status === "error")
    return <p className="text-red-500 text-sm">Ошибка загрузки</p>

  if (exams.length === 0) return null

  return (
    <div>
      
      <ul className="flex flex-col gap-2">
        {exams.map((exam) => (
          <li
            key={`${exam.date}-${exam.spec}`}
            className="bg-white/5 rounded-2xl backdrop-blur-sm p-3 flex items-center gap-3"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 rounded-2xl flex flex-col items-center justify-center border border-red-500/20">
              <CalendarDays size={16} className="text-red-500/80 mb-0.5" />
              {exam.days_left !== null && (
                <span className="text-red-500 text-[10px] font-bold">{exam.days_left}д</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="font-medium text-sm">{exam.spec}</div>
              <div className="text-zinc-500 text-xs">
                {new Date(exam.date + "T00:00:00").toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}