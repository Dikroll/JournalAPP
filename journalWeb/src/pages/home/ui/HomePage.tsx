import { ScheduleList, UserCard } from "@/widgets"

export function HomePage() {
  return (
    <div>
      <UserCard />
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">Расписание на сегодня</h1>
        <ScheduleList />
      </div>
    </div>
  )
}