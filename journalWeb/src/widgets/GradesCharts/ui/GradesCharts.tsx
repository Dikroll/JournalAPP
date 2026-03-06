import {
	calcTrend,
	toChartData
} from "@/entities/dashboard/hooks/useDashboardCharts"
import type { ChartPoint } from "@/entities/dashboard/model/types"
import {
	Bar, BarChart, Line, LineChart,
	ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"

interface Props {
  progress: ChartPoint[]
  attendance: ChartPoint[]
}

function TrendBadge({ trend }: { trend: number }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      trend > 0 ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"
    }`}>
      {trend > 0 ? "+" : ""}{trend}%
    </span>
  )
}

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "rgba(30,32,36,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
  },
  labelStyle: { color: "#9CA3AF", fontSize: 11 },
  itemStyle: { color: "#F2F2F2" },
}

export function GradesCharts({ progress, attendance }: Props) {
  const progressTrend = calcTrend(progress)
  const attendanceTrend = calcTrend(attendance)

  const progressData = toChartData(progress).map((d, i) => ({
    ...d,
    label: progress.filter((p) => p.points != null)[i]?.date?.slice(5) ?? "",
  }))
  const attendanceData = toChartData(attendance).map((d, i) => ({
    ...d,
    label: attendance.filter((a) => a.points != null)[i]?.date?.slice(5) ?? "",
  }))

  return (
    <div className="space-y-3">

      {progressData.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[24px] p-5 border border-white/10"
          style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#F2F2F2]">Динамика оценок</h3>
            {progressTrend != null && <TrendBadge trend={progressTrend} />}
          </div>
          <div style={{ height: 192 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[3, 5]} stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Line
                  type="monotone" dataKey="value" stroke="#F20519"
                  strokeWidth={3} dot={{ fill: "#F20519", r: 4 }} activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}


      {attendanceData.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[24px] p-5 border border-white/10"
          style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#F2F2F2]">Динамика посещаемости</h3>
            {attendanceTrend != null && <TrendBadge trend={attendanceTrend} />}
          </div>
          <div style={{ height: 192 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, "Посещаемость"]} />
                <Bar dataKey="value" fill="#F29F05" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}