import { useCallback, useState } from "react"
import { sendHomeworkApi } from "../api"

const FORBIDDEN = [".txt", ".csv"]
const MIN_TEXT = 5

export type SendStep = "idle" | "uploading" | "submitting" | "success" | "error"

interface State {
  file: File | null
  text: string
  mark: number
  step: SendStep
  error: string | null
}

export function useSendHomework(homeworkId: number, onSuccess?: () => void) {
  const [state, setState] = useState<State>({
    file: null, text: "", mark: 0, step: "idle", error: null,
  })

  const setFile = useCallback((f: File | null) => {
    if (!f) { setState((s) => ({ ...s, file: null, error: null })); return }
    const ext = "." + f.name.split(".").pop()?.toLowerCase()
    if (FORBIDDEN.includes(ext)) {
      setState((s) => ({ ...s, error: "Файлы .txt и .csv не принимаются" }))
      return
    }
    setState((s) => ({ ...s, file: f, error: null }))
  }, [])

  const setText = useCallback((v: string) =>
    setState((s) => ({ ...s, text: v, error: null })), [])

  const setMark = useCallback((v: number) =>
    setState((s) => ({ ...s, mark: v, error: null })), [])

  const reset = useCallback(() =>
    setState({ file: null, text: "", mark: 0, step: "idle", error: null }), [])

  const submit = useCallback(async () => {
    const trimmed = state.text.trim()
    const hasFile = !!state.file
    const hasText = trimmed.length >= MIN_TEXT
    const textTooShort = trimmed.length > 0 && trimmed.length < MIN_TEXT

    // Нужно хотя бы что-то одно
    if (!hasFile && !hasText) {
      setState((s) => ({
        ...s,
        error: textTooShort
          ? `Текст слишком короткий — минимум ${MIN_TEXT} символов`
          : "Прикрепите файл или введите текстовый ответ",
      }))
      return
    }
    if (state.mark < 1) {
      setState((s) => ({ ...s, error: "Оцените сложность задания" }))
      return
    }

    try {
      let filename = ""
      let file_path = ""
      let tmp_file = ""

      // Шаг 1: если есть файл — сначала загружаем его
      if (hasFile) {
        setState((s) => ({ ...s, step: "uploading", error: null }))
        const uploaded = await sendHomeworkApi.uploadFile(state.file!)
        filename = uploaded.filename
        file_path = uploaded.file_path
        tmp_file = uploaded.tmp_file
      }

      // Шаг 2: отправляем итоговый payload
      setState((s) => ({ ...s, step: "submitting" }))
      await sendHomeworkApi.submit({
        id: homeworkId,
        stud_answer: trimmed,   // пустая строка если нет текста — сервер принимает
        mark: state.mark,
        creation_time: "01:00:00",
        filename,
        file_path,
        tmp_file,
      })

      setState((s) => ({ ...s, step: "success" }))
      onSuccess?.()
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d.msg).join(", ")
        : (detail ?? e?.response?.data?.message ?? "Ошибка отправки")
      setState((s) => ({ ...s, step: "error", error: msg }))
    }
  }, [state, homeworkId, onSuccess])

  const isLoading = state.step === "uploading" || state.step === "submitting"

  const loadingLabel =
    state.step === "uploading" ? "Загружаем файл..." : "Отправляем..."

  return {
    file: state.file, text: state.text, mark: state.mark,
    step: state.step, error: state.error,
    isLoading, loadingLabel,
    setFile, setText, setMark, submit, reset,
  }
}