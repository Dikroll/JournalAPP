import { useExamResults } from '@/entities/exam/hooks/useExamResults'
import { CheckCircle, Clock } from 'lucide-react'

function getMarkColor(mark: number) {
  if (mark >= 4) return 'text-status-checked bg-checked-subtle border-status-checked/30'
  if (mark === 3) return 'text-status-pending bg-pending-subtle border-status-pending/30'
  if (mark > 0) return 'text-status-overdue bg-overdue-bg border-status-overdue/30'
  return 'text-app-muted bg-app-surface-strong border-app-border'
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
    return <p className='text-status-overdue text-sm text-center py-8'>Не удалось загрузить экзамены</p>
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
                      <h4 className='text-sm font-semibold text-app-text truncate'>{exam.spec}</h4>
                      <span className='text-xs text-app-muted flex-shrink-0'>{exam.mark_type}</span>
                    </div>
                    <p className='text-xs text-app-muted truncate mb-1'>{exam.teacher}</p>
                    {exam.date && (
                      <div className='flex items-center gap-1'>
                        <CheckCircle size={12} className='text-status-checked' />
                        <span className='text-xs text-status-checked'>{formatDate(exam.date)}</span>
                      </div>
                    )}
                    {exam.comment && (
                      <p className='text-xs text-app-muted mt-1 truncate'>{exam.comment}</p>
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
                    <h4 className='text-sm font-semibold text-app-text truncate mb-1'>{exam.spec}</h4>
                    <p className='text-xs text-app-muted truncate'>{exam.teacher}</p>
                  </div>
                  <div className='w-10 h-10 rounded-xl flex items-center justify-center bg-app-surface-strong border border-app-border'>
                    <Clock size={16} className='text-app-muted' />
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