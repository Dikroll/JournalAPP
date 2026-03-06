import { useGradesCharts } from "@/entities/dashboard/hooks/useGradesCharts"
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

const TOOLTIP_W = 96

function CustomTooltip({ active, payload, label, formatter, visible, coordinate, viewBox }: any) {
  if (!active || !payload?.length || !visible) return null
  const display = formatter ? formatter(payload[0].value) : String(payload[0].value)

  const vbLeft = viewBox?.left ?? 0
  const vbRight = vbLeft + (viewBox?.width ?? 300)
  const x = Math.max(vbLeft + TOOLTIP_W / 2, Math.min(coordinate?.x ?? 0, vbRight - TOOLTIP_W / 2))

  return (
    <div style={{
      position: "absolute",
      left: x,
      top: 8,
      transform: "translateX(-50%)",
      width: TOOLTIP_W,
      background: "rgba(30,32,36,0.97)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "16px",
      padding: "10px 16px",
      boxShadow: "0 4px 24px 0 rgba(0,0,0,0.5)",
      pointerEvents: "none",
      zIndex: 50,
    }}>
      <p style={{ color: "#9CA3AF", fontSize: 11, marginBottom: 4, whiteSpace: "nowrap" }}>{label}</p>
      <p style={{ color: "#F2F2F2", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{display}</p>
    </div>
  )
}

function NoCursor() { return null }

const axisProps = {
  fontSize: 12,
  tickLine: false,
  axisLine: false,
  tick: { fill: "#9CA3AF" },
} as const

const tooltipWrapperStyle = {
  outline: "none",
  border: "none",
  pointerEvents: "none" as const,
  overflow: "visible" as const,
  zIndex: 50,
}

export function GradesCharts({ progress, attendance }: Props) {
  const {
    progressData, attendanceData,
    progressTrend, attendanceTrend,
    progressTooltip, attendanceTooltip,
  } = useGradesCharts(progress, attendance)

  return (
    <div className="space-y-3">
      {progressData.length > 0 && (
        <div
          className="bg-white/5 backdrop-blur-xl rounded-[24px] p-5 border border-white/10"
          style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#F2F2F2]">Динамика оценок</h3>
            {progressTrend != null && <TrendBadge trend={progressTrend} />}
          </div>
          <div style={{ height: 192 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progressData}
                margin={{ top: 16, right: 8, left: -8, bottom: 0 }}
                tabIndex={-1}
                onMouseMove={progressTooltip.show}
              >
                <XAxis dataKey="label" {...axisProps} height={24} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} {...axisProps} width={30} />
                <Tooltip
                  content={<CustomTooltip visible={progressTooltip.visible} />}
                  cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                  isAnimationActive={false}
                  wrapperStyle={tooltipWrapperStyle}
                  allowEscapeViewBox={{ x: false, y: true }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#F20519"
                  strokeWidth={3}
                  dot={{ fill: "#F20519", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#F20519" }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {attendanceData.length > 0 && (
        <div
          className="bg-white/5 backdrop-blur-xl rounded-[24px] p-5 border border-white/10"
          style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#F2F2F2]">Динамика посещаемости</h3>
            {attendanceTrend != null && <TrendBadge trend={attendanceTrend} />}
          </div>
          <div style={{ height: 192 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceData}
                margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
                tabIndex={-1}
                onMouseMove={attendanceTooltip.show}
              >
                <XAxis dataKey="label" {...axisProps} height={24} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} {...axisProps} width={36} />
                <Tooltip
                  content={<CustomTooltip formatter={(v: number) => `${v}%`} visible={attendanceTooltip.visible} />}
                  cursor={<NoCursor />}
                  isAnimationActive={false}
                  wrapperStyle={tooltipWrapperStyle}
                  allowEscapeViewBox={{ x: false, y: true }}
                />
                <Bar dataKey="value" fill="#F29F05" radius={[8, 8, 0, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}