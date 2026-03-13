import { ArrowLeft, CheckCircle, Circle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePayment } from '@/entities/payment/hooks/usePayment'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

function formatAmount(amount: number) {
  return amount.toLocaleString('ru-RU') + ' ₽'
}

const REQUISITES = [
  { label: 'Получатель', value: 'АНО ПОО ММКЦТ "Академия ТОП" Филиал колледжа "Академия ТОП Иваново"' },
  { label: 'ИНН', value: '7730265193' },
  { label: 'БИК', value: '044525700' },
  { label: 'Расчётный счёт', value: '40703810600000004530' },
  { label: 'Назначение платежа', value: 'За 3 Год 1С код: 526010131' },
]

export function PaymentPage() {
  const navigate = useNavigate()
  const { summary, status } = usePayment()

  return (
    <div className='pb-6'>
      <div className='flex items-center gap-3 px-4 pt-4 pb-4'>
        <button
          onClick={() => navigate(-1)}
          className='w-9 h-9 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center text-[#9CA3AF] active:scale-95 transition-transform'
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className='text-base font-bold text-[#F2F2F2]'>Оплата</h1>
      </div>

      <div className='px-4 space-y-3'>
        {status === 'loading' && (
          <div className='space-y-3'>
            {[120, 150, 250, 200].map((h, i) => (
              <div key={i} className='bg-white/5 rounded-[24px] animate-pulse' style={{ height: h }} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <p className='text-center text-[#EF4444] text-sm py-12'>Не удалось загрузить данные</p>
        )}

        {summary && (
          <>
            {/* График платежей */}
            <div className='bg-white/5 rounded-[20px] border border-white/10 p-4'>
              <p className='text-sm font-semibold text-[#F2F2F2] mb-3'>График платежей</p>
              <div className='flex flex-col gap-2'>
                {summary.schedule.map((item) => (
                  <div key={item.id} className='flex items-center gap-3 bg-white/5 rounded-[14px] p-3'>
                    {item.is_paid
                      ? <CheckCircle size={16} className='text-[#4ADE80] flex-shrink-0' />
                      : <Circle size={16} className='text-[#9CA3AF] flex-shrink-0' />
                    }
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-[#F2F2F2]'>{item.description}</p>
                      <p className='text-xs text-[#9CA3AF]'>до {formatDate(item.due_date)}</p>
                    </div>
                    <p className={`text-sm font-semibold flex-shrink-0 ${item.is_paid ? 'text-[#4ADE80]' : 'text-[#F2F2F2]'}`}>
                      {formatAmount(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Реквизиты */}
            <div className='bg-white/5 rounded-[20px] border border-white/10 p-4'>
              <p className='text-sm font-semibold text-[#F2F2F2] mb-3'>Реквизиты для оплаты</p>
              <div className='flex flex-col gap-3'>
                {REQUISITES.map((r) => (
                  <div key={r.label} className='flex flex-col gap-0.5'>
                    <p className='text-[10px] text-[#9CA3AF]'>{r.label}</p>
                    <p className='text-xs text-[#F2F2F2]'>{r.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* История платежей */}
            {summary.history.length > 0 && (
              <div className='bg-white/5 rounded-[20px] border border-white/10 p-4'>
                <p className='text-sm font-semibold text-[#F2F2F2] mb-3'>История платежей</p>
                <div className='flex flex-col gap-2'>
                  {summary.history.map((item, i) => (
                    <div key={i} className='flex items-center gap-3 bg-white/5 rounded-[14px] p-3'>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-[#F2F2F2] truncate'>{item.description || 'Платёж'}</p>
                        <p className='text-xs text-[#9CA3AF]'>{formatDate(item.date)}</p>
                      </div>
                      <p className='text-sm font-semibold text-[#4ADE80] flex-shrink-0'>
                        +{formatAmount(item.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}