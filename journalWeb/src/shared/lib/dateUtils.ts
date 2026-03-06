
export function formatDateLong(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function getTodayString(): string {
  const now = new Date()
  return toDateString(now.getFullYear(), now.getMonth(), now.getDate())
}