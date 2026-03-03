
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import type { HomeworkStatus } from "../homework/model/useHomeworkGroups"

export const STATUS_CONFIG: Record<
  HomeworkStatus,
  {
    label: string
    icon: React.ElementType
    borderColor: string
    textColor: string
  }
> = {
  overdue: {
    label: "Просроченные",
    icon: AlertTriangle,
    borderColor: "border-l-[#DC2626] border-b-[#DC2626]",
    textColor: "text-[#DC2626]",
  },
  new: {
    label: "Новые",
    icon: Sparkles,
    borderColor: "border-l-[#3B82F6] border-b-[#3B82F6]",
    textColor: "text-[#3B82F6]",
  },
  pending: {
    label: "На проверке",
    icon: BookOpen,
    borderColor: "border-l-[#3B82F6] border-b-[#3B82F6]",
    textColor: "text-[#3B82F6]",
  },
  checked: {
    label: "Проверенные",
    icon: CheckCircle,
    borderColor: "border-l-[#10B981] border-b-[#10B981]",
    textColor: "text-[#10B981]",
  },
  returned: {
    label: "Возвращённые",
    icon: RotateCcw,
    borderColor: "border-l-[#6B7280] border-b-[#6B7280]",
    textColor: "text-[#6B7280]",
  },
}

export function getGradeStyle(grade: number | null | undefined) {
  if (!grade)
    return {
      bg: "bg-[#10B981]/5",
      badge: "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30",
    }
  if (grade >= 90)
    return {
      bg: "bg-[#10B981]/10",
      badge: "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30",
    }
  if (grade >= 75)
    return {
      bg: "bg-[#3B82F6]/10",
      badge: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30",
    }
  if (grade >= 60)
    return {
      bg: "bg-[#F59E0B]/10",
      badge: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30",
    }
  return {
    bg: "bg-[#DC2626]/10",
    badge: "bg-[#DC2626]/20 text-[#DC2626] border-[#DC2626]/30",
  }
}