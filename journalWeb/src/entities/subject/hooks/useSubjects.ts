import { useEffect } from "react"
import { subjectApi } from "../api"
import { useSubjectStore } from "../model/store"

const CACHE_TTL_MS = 60 * 60 * 1000 

export function useSubjects() {
  const { subjects, status, loadedAt, setSubjects, setStatus, setLoadedAt } =
    useSubjectStore()

  useEffect(() => {
    if (status === "loading") return
    if (loadedAt && Date.now() - loadedAt < CACHE_TTL_MS) return

    setStatus("loading")
    subjectApi
      .getAll()
      .then((data) => {
        setSubjects(data)
        setLoadedAt(Date.now())
        setStatus("success")
      })
      .catch(() => setStatus("error"))
  }, [])

  return { subjects, status }
}