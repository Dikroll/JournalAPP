export interface HomeworkItem {
  id: number
  theme: string
  spec_name: string
  spec_id: number | null
  teacher: string
  issued_date: string
  deadline: string
  overdue_date: string | null
  status: number          // числовой статус: 0/1/2/3/5
  grade: number | null    // оценка из homework_stud.mark (только у checked)
  has_file: boolean
	stud_answer: string | null
  file_url: string | null
  comment: string | null
}

export interface HomeworkCounters {
  total: number
  pending: number
  checked: number
  overdue: number
  new: number
  returned: number
}