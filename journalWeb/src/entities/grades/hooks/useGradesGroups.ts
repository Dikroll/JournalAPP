import { useMemo } from "react"
import type { GradeEntry, GradeMarks, GradeType } from "../model/types"

export const GRADE_TYPE_CONFIG: Record<GradeType, { label: string; color: string }> = {
  homework:  { label: "ДЗ",       color: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30" },
  lab:       { label: "Лаб",      color: "bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30" },
  classwork: { label: "КР",       color: "bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/30" },
  control:   { label: "Контроль", color: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30" },
  practical: { label: "Практ",    color: "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30" },
  final:     { label: "Зачёт",    color: "bg-[#A855F7]/20 text-[#A855F7] border-[#A855F7]/30" },
}

export function getGradeColor(grade: number): string {
  if (grade >= 5) return "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30"
  if (grade >= 4) return "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30"
  if (grade >= 3) return "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30"
  if (grade >= 2) return "bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30"
  return "bg-[#DC2626]/20 text-[#DC2626] border-[#DC2626]/30"
}

export function flattenMarks(marks: GradeMarks): Array<{ type: GradeType; value: number }> {
  return (Object.entries(marks) as [GradeType, number | null][])
    .filter(([, v]) => v != null && v !== 0)
    .map(([type, value]) => ({ type, value: value! }))
}

export interface GradeEntryExpanded extends GradeEntry {
  flatMarks: Array<{ type: GradeType; value: number }>
  averageMark: number | null
}

export interface SubjectStats {
  spec_id: number
  spec_name: string
  entries: GradeEntryExpanded[]
  averageGrade: number
  totalMarks: number
}

export function useGradesGroups(entries: GradeEntry[]) {
  const expanded = useMemo<GradeEntryExpanded[]>(() => {
    return entries.map((e) => {
      const flatMarks = e.marks ? flattenMarks(e.marks) : []
      const averageMark = flatMarks.length
        ? flatMarks.reduce((s, m) => s + m.value, 0) / flatMarks.length
        : null
      return { ...e, flatMarks, averageMark }
    })
  }, [entries])

  const byDate = useMemo(() => {
    const map: Record<string, GradeEntryExpanded[]> = {}
    for (const e of expanded) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        items: [...items].sort((a, b) => a.lesson_number - b.lesson_number),
      }))
  }, [expanded])

  const bySubject = useMemo<SubjectStats[]>(() => {
    const map: Record<number, GradeEntryExpanded[]> = {}
    for (const e of expanded) {
      if (!map[e.spec_id]) map[e.spec_id] = []
      map[e.spec_id].push(e)
    }
    return Object.values(map)
      .map((items) => {

        const withMarks = items.filter((e) => e.flatMarks.length > 0)
        const allMarks = withMarks.flatMap((e) => e.flatMarks.map((m) => m.value))
        const avg = allMarks.length
          ? allMarks.reduce((s, v) => s + v, 0) / allMarks.length
          : 0
        return {
          spec_id: items[0].spec_id,
          spec_name: items[0].spec_name,
          entries: withMarks.sort((a, b) => a.date.localeCompare(b.date)),
          averageGrade: avg,
          totalMarks: allMarks.length,
        }
      })
      .filter((s) => s.totalMarks > 0)
      .sort((a, b) => a.spec_name.localeCompare(b.spec_name, "ru"))
  }, [expanded])

  const byMonth = useMemo(() => {
    const map: Record<string, Record<string, GradeEntryExpanded[]>> = {}
    for (const e of expanded) {
      const month = e.date.slice(0, 7)
      if (!map[month]) map[month] = {}
      if (!map[month][e.date]) map[month][e.date] = []
      map[month][e.date].push(e)
    }
    return map
  }, [expanded])

  const stats = useMemo(() => {
    const allMarks = expanded.flatMap((e) => e.flatMarks.map((m) => m.value))
    const avg = allMarks.length
      ? allMarks.reduce((s, v) => s + v, 0) / allMarks.length
      : 0
    const total = expanded.length
    const absences = expanded.filter((e) => !e.attended).length
    return {
      averageGrade: avg,
      attendanceRate: total > 0 ? ((total - absences) / total) * 100 : 0,
    }
  }, [expanded])

  return { byDate, bySubject, byMonth, stats }
}