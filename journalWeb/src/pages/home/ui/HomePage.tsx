import { ScheduleList, TopBar } from "@/widgets"

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#1F2024] text-[#F2F2F2] pb-28">
      <TopBar />
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">Расписание на сегодня</h1>
        <ScheduleList />
      </div>
    </div>
  )
}