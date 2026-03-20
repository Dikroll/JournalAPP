import { useExamResults } from '@/entities/exam/hooks/useExamResults'
import { CheckCircle, Clock } from 'lucide-react'

function getMarkColor(mark: number) {
  if (mark >= 4) return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30'
  if (mark === 3) return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30'
  if (mark > 0) return 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30'
  return 'text-[#9CA3AF] bg-white/5 border-white/10'
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export function GradesExamList() {
  const { exams, status } = useExamResults()

  if (status === 'loading') {
    return (
      <div className='space-y-3'>
        {[0, 1, 2].map(i => (
          <div key={i} className='bg-app-surface rounded-[24px] animate-pulse h-20' />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return <p className='text-[#DC2626] text-sm text-center py-8'>Не удалось загрузить экзамены</p>
  }

  if (exams.length === 0) {
    return <p className='text-app-muted text-sm text-center py-8'>Нет экзаменов</p>
  }

  const passed = exams.filter(e => e.mark > 0)
  const pending = exams.filter(e => e.mark === 0)

  return (
    <div className='space-y-4'>
      {passed.length > 0 && (
        <div className='space-y-2'>
          <div className='text-sm font-medium text-app-muted px-1'>Сданные</div>
          <div className='bg-app-surface rounded-[24px] p-3 border border-app-border' style={{ boxShadow: 'var(--shadow-card)' }}>
            {passed.map((exam, idx) => (
              <div key={exam.exam_id}>
                {idx > 0 && <div className='border-t border-app-border my-1' />}
                <div className='flex items-center justify-between py-2'>
                  <div className='flex-1 min-w-0 mr-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h4 className='text-sm font-semibold text-[#F2F2F2] truncate'>{exam.spec}</h4>
                      <span className='text-xs text-[#6B7280] flex-shrink-0'>{exam.mark_type}</span>
                    </div>
                    <p className='text-xs text-[#9CA3AF] truncate mb-1'>{exam.teacher}</p>
                    {exam.date && (
                      <div className='flex items-center gap-1'>
                        <CheckCircle size={12} className='text-[#10B981]' />
                        <span className='text-xs text-[#10B981]'>{formatDate(exam.date)}</span>
                      </div>
                    )}
                    {exam.comment && (
                      <p className='text-xs text-[#9CA3AF] mt-1 truncate'>{exam.comment}</p>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border ${getMarkColor(exam.mark)}`}>
                    {exam.mark}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className='space-y-2'>
          <div className='text-sm font-medium text-app-muted px-1'>Не сданные</div>
          <div className='bg-app-surface rounded-[24px] p-3 border border-app-border' style={{ boxShadow: 'var(--shadow-card)' }}>
            {pending.map((exam, idx) => (
              <div key={exam.exam_id}>
                {idx > 0 && <div className='border-t border-app-border my-1' />}
                <div className='flex items-center justify-between py-2'>
                  <div className='flex-1 min-w-0 mr-3'>
                    <h4 className='text-sm font-semibold text-[#F2F2F2] truncate mb-1'>{exam.spec}</h4>
                    <p className='text-xs text-[#9CA3AF] truncate'>{exam.teacher}</p>
                  </div>
                  <div className='w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10'>
                    <Clock size={16} className='text-[#9CA3AF]' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}