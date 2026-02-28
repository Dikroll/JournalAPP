import { ScheduleList, UserCard, TopBar } from "@/widgets"

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-500">
      <TopBar />
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">Расписание на сегодня</h1>
        <ScheduleList />
      </div>
    </div>
  )
}