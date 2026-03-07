import { ttl } from "@/shared/config/cache"
import { useEffect } from "react"
import { examApi } from "../api"
import { useExamStore } from "../model/store"

const CACHE_TTL_MS = ttl.SCHEDULE * 1000

export function useFutureExams() {
  const { exams, status, loadedAt, setExams, setStatus, setLoadedAt } = useExamStore()

  useEffect(() => {
    if (status === "loading") return
    if (loadedAt && Date.now() - loadedAt < CACHE_TTL_MS) return

    setStatus("loading")
    examApi
      .getFutureExams()
      .then((data) => {
        setExams(data)
        setLoadedAt(Date.now())
        setStatus("success")
      })
      .catch(() => setStatus("error"))
  }, [])

  return { exams, status }
}