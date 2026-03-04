import { ScheduleList } from "@/widgets"

export function HomePage() {
  return (
    <div className="min-h-screen pb-28">
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">Расписание на сегодня</h1>
        <ScheduleList />
      </div>
    </div>
  )
}