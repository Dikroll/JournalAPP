
import type { SubjectStats } from "@/entities/grades/hooks/useGradesGroups"
import { GRADE_TYPE_CONFIG } from "@/entities/grades/hooks/useGradesGroups"
import { Clock } from "lucide-react"

interface Props {
  bySubject: SubjectStats[]
}

export function GradesSubjectList({ bySubject }: Props) {
  if (bySubject.length === 0) {
    return <p className="text-[#9CA3AF] text-sm text-center py-8">Нет данных</p>
  }

  return (
    <div className="space-y-3">
      {bySubject.map((subj, index) => (
        <div key={subj.spec_id}
          className="bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/10"
          style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-[#F2F2F2]">
                {index + 1}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F2F2F2]">{subj.spec_name}</h3>
                <p className="text-xs text-[#6B7280]">
                  {subj.totalLessons} {
                    subj.totalLessons === 1 ? "занятие" :
                    subj.totalLessons < 5 ? "занятия" : "занятий"
                  }
                  {subj.absences > 0 && (
                    <span className="text-[#DC2626] ml-1">· {subj.absences} пропуска</span>
                  )}
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#F29F05]/20 border border-[#F29F05]/30">
              <span className="text-lg font-bold text-[#F29F05]">
                {subj.averageGrade > 0 ? subj.averageGrade.toFixed(1) : "—"}
              </span>
            </div>
          </div>

          <div className="-mx-4 overflow-x-auto scrollbar-none">
            <div className="flex gap-3 px-4 pb-2 w-max">
              {subj.entries.map((entry) => (
                <div key={`${entry.date}-${entry.lesson_number}`}
                  className="flex flex-col items-center gap-1.5">
                  {!entry.attended ? (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#DC2626]/20 border-2 border-[#DC2626]">
                      <span className="text-[#DC2626] font-bold text-sm">Н</span>
                    </div>
                  ) : entry.flatMarks.length === 0 ? (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border-2 border-white/20">
                      <Clock size={16} className="text-[#9CA3AF]" />
                    </div>
                  ) : (
                    entry.flatMarks.map(({ type, value }) => (
                      <div key={type}
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          value >= 5 ? "bg-[#10B981]/20 border-[#10B981]" :
                          value >= 4 ? "bg-[#3B82F6]/20 border-[#3B82F6]" :
                          value >= 3 ? "bg-[#F59E0B]/20 border-[#F59E0B]" :
                          "bg-[#DC2626]/20 border-[#DC2626]"
                        }`}>
                        <span className="text-white font-bold text-lg">{value}</span>
                      </div>
                    ))
                  )}
                  <div className="text-center">
                    <div className="text-xs text-[#F2F2F2] whitespace-nowrap">
                      {entry.date.slice(8, 10)}.{entry.date.slice(5, 7)}
                    </div>
                    <div className="text-xs text-[#6B7280]">Пара {entry.lesson_number}</div>
                  </div>
                  {entry.flatMarks.map(({ type }) => (
                    <span key={type}
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap ${GRADE_TYPE_CONFIG[type].color}`}>
                      {GRADE_TYPE_CONFIG[type].label}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}