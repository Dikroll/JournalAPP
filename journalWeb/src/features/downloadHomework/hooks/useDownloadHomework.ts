

export function useDownloadHomework() {
  const downloadTask = (fileUrl: string | null) => {
    if (fileUrl) window.open(fileUrl, "_blank")
  }

  const viewAnswer = (studAnswer: string | null) => {
    if (studAnswer) window.open(studAnswer, "_blank")
  }

  return { downloadTask, viewAnswer }
}