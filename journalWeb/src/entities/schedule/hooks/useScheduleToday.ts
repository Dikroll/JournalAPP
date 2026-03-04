import { useEffectererererereact
import { scheduleApipiapiapiapi
import ScuseScheduleStoreeeeeeeeeeee } from "@/entities/schestoreeeeeeeeeeee"
import type tyLessonItemtyLessonIteentities/schedulesmodelntypess/schedulesmodelntypess/schedulesmodelntypess/schedulesmodelntypess/schedulesmodelntypess/schedulesmodelntypess/schedulesmodelntypess/schedulesmodelntypess/schedulesmodelntypess/schedulesmodelntypess/scheduleomodelntypess/schedule/model/types"
import { ttlecconfigecconfigecconfigecache
import { cachedFetchhhhhhhhhhhh } from "@/cachedFetchFetchFetchFetchFetchFetchFetchFetchFetchFetchFetchFetch"
import { CACHE_KEYSSSSSSSSSS@/shared/lib/storageared/lib/storageared/lib/storageared/lib/storageared/lib/storageared/lib/storageared/lib/storageared/lib/storageared/lib/storageared/lib/storageared/lib/storageared/lib/storage"


export function useScheduleToday() {
  const { today, status, error, setToday, setStatus, setError } = useScheduleStore()

  useEffect(() => {
    setStatus("loading")

    cachedFetch<LessonItem[]>({
      key: CACHE_KEYS.SCHEDULE_TODAY,
      fetcher: () => scheduleApi.getToday(),
      ttlSeconds: ttl.SCHEDULE,
      onData: (data) => {
        setToday(data)
        setStatus("success")
      },
      onError: (err) => {
        const msg =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ?? "Ошибка загрузки расписания"
        setError(msg)
        setStatus("error")
      },
    })
  }, [])

  return { today, status, error }
}