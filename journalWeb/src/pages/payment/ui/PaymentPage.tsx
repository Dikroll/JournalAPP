import { ArrowLeft, CheckCircle, Circle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePayment } from '@/entities/payment/hooks/usePayment'
import { usePaymentIndex } from '@/entities/payment/hooks/usePaymentIndex'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

function formatAmount(amount: number) {
  return amount.toLocaleString('ru-RU') + ' ₽'
}

export function PaymentPage() {
  const navigate = useNavigate()
  const { summary, status } = usePayment()
  const { index } = usePaymentIndex()

  const requisites = index ? [
    { label: 'Получатель', value: index.payment.organization_name },
    { label: 'Плательщик', value: index.payment.payer_full_name },
    { label: 'Банк', value: index.payment.bank_name },
    { label: 'Расчётный счёт', value: index.payment.settlement_account },
    { label: 'Назначение платежа', value: index.payment.purpose_of_payment },
  ] : []

  return (
    <div className='pb-6 text-[#F2F2F2]'>
      <div className='flex items-center gap-3 px-4 pt-4 pb-4'>
        <button
          onClick={() => navigate(-1)}
          className='w-9 h-9 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center text-[#9CA3AF] active:scale-95 transition-transform'
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className='text-base font-bold'>Оплата</h1>
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
            <div className='bg-white/5 rounded-[24px] border border-white/10 p-4'>
              <p className='text-sm font-semibold mb-3'>График платежей</p>
              <div className='flex flex-col gap-2'>
                {summary.schedule.map((item) => (
                  <div key={item.id} className='flex items-center gap-3 bg-white/5 rounded-[16px] p-3'>
                    {item.is_paid
                      ? <CheckCircle size={18} className='text-[#4ADE80] flex-shrink-0' />
                      : <Circle size={18} className='text-[#9CA3AF] flex-shrink-0' />
                    }
                    <div className='flex-1 min-w-0'>
                      <p className={`text-sm font-medium ${item.is_paid ? 'text-[#9CA3AF] line-through' : 'text-[#F2F2F2]'}`}>
                        {item.description}
                      </p>
                      <p className='text-xs text-[#9CA3AF]'>до {formatDate(item.due_date)}</p>
                    </div>
                    <p className={`text-sm font-bold flex-shrink-0 ${item.is_paid ? 'text-[#4ADE80]' : 'text-[#F2F2F2]'}`}>
                      {formatAmount(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Реквизиты */}
            {requisites.length > 0 && (
              <div className='bg-white/5 rounded-[24px] border border-white/10 p-4'>
                <p className='text-sm font-semibold text-[#F2F2F2] mb-3'>Реквизиты для оплаты</p>
                <div className='flex flex-col gap-3'>
                  {requisites.map((r) => (
                    <div key={r.label}>
                      <p className='text-[10px] text-[#6B7280] mb-0.5'>{r.label}</p>
                      <p className='text-xs text-[#F2F2F2]'>{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* История платежей */}
            {summary.history.length > 0 && (
              <div className='bg-white/5 rounded-[24px] border border-white/10 p-4'>
                <p className='text-sm font-semibold text-[#F2F2F2] mb-3'>История платежей</p>
                <div className='flex flex-col gap-2'>
                  {summary.history.map((item, i) => (
                    <div key={i} className='flex items-center justify-between bg-white/5 rounded-[16px] p-3'>
                      <div className='flex-1 min-w-0 mr-3'>
                        <p className='text-sm font-medium text-[#F2F2F2] truncate'>{item.description || 'Платёж'}</p>
                        <p className='text-xs text-[#9CA3AF]'>{formatDate(item.date)}</p>
                      </div>
                      <p className='text-sm font-bold text-[#4ADE80] flex-shrink-0'>
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