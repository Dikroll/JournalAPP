import { useCallback, useState } from "react"

/**
  @param initialYYYYMM - строка формата "YYYY-MM", указывающая начальный месяц. Если не указано, используется текущий месяц.
 */
export function useMonthNav(initialYYYYMM?: string) {
  const now = new Date()
  const defaultYear = initialYYYYMM
    ? Number(initialYYYYMM.split("-")[0])
    : now.getFullYear()
  const defaultMonth = initialYYYYMM
    ? Number(initialYYYYMM.split("-")[1]) - 1
    : now.getMonth()

  const [year, setYear] = useState(defaultYear)
  const [month, setMonth] = useState(defaultMonth)

  const prevMonth = useCallback(() => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }, [month])

  const nextMonth = useCallback(() => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }, [month])

  return { year, month, prevMonth, nextMonth }
}