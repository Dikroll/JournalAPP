import { useEffect, useState } from "react"

function getCurrentMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function useCurrentMinutes(): number {
  const [nowMinutes, setNowMinutes] = useState(getCurrentMinutes)

  useEffect(() => {
    const timer = setInterval(() => setNowMinutes(getCurrentMinutes()), 60_000)
    return () => clearInterval(timer)
  }, [])

  return nowMinutes
}