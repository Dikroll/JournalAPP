export type HomeworkStatus = "overdue" | "new" | "pending" | "checked" | "returned"

export const STATUS_ORDER: HomeworkStatus[] = [
  "overdue",
  "new",
  "pending",
  "checked",
  "returned",
]

export const STATUS_KEY_MAP: Record<HomeworkStatus, number> = {
  overdue: 0,
  checked: 1,
  pending: 2,
  new:     3,
  returned: 5,
}

export const STATUS_MAP: Record<number, HomeworkStatus> = Object.fromEntries(
  Object.entries(STATUS_KEY_MAP).map(([status, key]) => [key, status])
) as Record<number, HomeworkStatus>