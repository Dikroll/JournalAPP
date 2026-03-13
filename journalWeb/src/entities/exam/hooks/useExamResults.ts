import { useState, useEffect } from 'react'
import { examApi } from '../api'
import type { ExamResult } from '../model/types'

export function useExamResults() {
  const [exams, setExams] = useState<ExamResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    setStatus('loading')
    examApi.getExams()
      .then(data => { setExams(data); setStatus('success') })
      .catch(() => setStatus('error'))
  }, [])

  return { exams, status }
}