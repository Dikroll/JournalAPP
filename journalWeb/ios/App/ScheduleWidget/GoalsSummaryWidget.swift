import WidgetKit
import SwiftUI

// MARK: — Grade & risk palette
//
// Hex values are mirrored from the React `GoalsSummaryCard` so the native
// widget reads as the same surface as the web card.

private enum GoalsPalette {
    static let grade5 = Color(red: 0x10 / 255, green: 0xB9 / 255, blue: 0x81 / 255) // #10B981
    static let grade4 = Color(red: 0x3B / 255, green: 0x82 / 255, blue: 0xF6 / 255) // #3B82F6
    static let grade3 = Color(red: 0xF5 / 255, green: 0x9E / 255, blue: 0x0B / 255) // #F59E0B
    static let grade2 = Color(red: 0xF9 / 255, green: 0x73 / 255, blue: 0x16 / 255) // #F97316
    static let grade1 = Color(red: 0xDC / 255, green: 0x26 / 255, blue: 0x26 / 255) // #DC2626
    static let neutral = Color(red: 0x8A / 255, green: 0x94 / 255, blue: 0xA6 / 255) // #8a94a6

    static func color(for mark: Int) -> Color {
        switch mark {
        case 5: return grade5
        case 4: return grade4
        case 3: return grade3
        case 2: return grade2
        case 1: return grade1
        default: return neutral
        }
    }

    /// Same RGB as `color(for:)` but at 20% opacity — mirrors GRADE_BG.
    static func background(for mark: Int) -> Color {
        color(for: mark).opacity(0.20)
    }

    static func riskColor(_ risk: String) -> Color {
        switch risk {
        case "safe": return grade5
        case "watch": return grade3
        case "danger": return grade1
        default: return neutral // no_goal / unknown
        }
    }

    static func riskBackground(_ risk: String) -> Color {
        riskColor(risk).opacity(0.20)
    }
}

// MARK: — Entry / Provider

struct GoalsSummaryEntry: TimelineEntry {
    let date: Date
    let state: GoalsLoadState
}

struct GoalsSummaryProvider: TimelineProvider {
    func placeholder(in context: Context) -> GoalsSummaryEntry {
        GoalsSummaryEntry(date: Date(), state: GoalsLoadState(payload: nil))
    }

    func getSnapshot(in context: Context, completion: @escaping (GoalsSummaryEntry) -> Void) {
        completion(GoalsSummaryEntry(date: Date(), state: GoalsWidgetStore.loadState()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<GoalsSummaryEntry>) -> Void) {
        let now = Date()
        let entry = GoalsSummaryEntry(date: now, state: GoalsWidgetStore.loadState())
        let nextRefresh = min(
            now.addingTimeInterval(30 * 60),
            GoalsWidgetStore.nextMidnight(after: now)
        )
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }
}

// MARK: — View

struct GoalsSummaryWidgetView: View {
    let entry: GoalsSummaryEntry
    @Environment(\.colorScheme) private var colorScheme

    private var theme: WidgetTheme { WidgetTheme(isDark: colorScheme == .dark) }
    private var payload: GoalsPayload? { entry.state.payload }

    private var distributionCounts: [Int: Int] {
        let dist = payload?.distribution
        return [
            5: dist?.five ?? 0,
            4: dist?.four ?? 0,
            3: dist?.three ?? 0,
            2: dist?.two ?? 0,
            1: dist?.one ?? 0,
        ]
    }

    private var totalMarks: Int {
        if let total = payload?.totalMarks { return total }
        return distributionCounts.values.reduce(0, +)
    }

    private var totalSubjectsWithGoals: Int {
        payload?.summary?.totalSubjectsWithGoals ?? 0
    }

    private var risk: String {
        if totalSubjectsWithGoals == 0 { return "no_goal" }
        return payload?.summary?.risk ?? "no_goal"
    }

    private var badgeLabel: String {
        if totalSubjectsWithGoals == 0 { return "поставь цели" }
        let atRisk = payload?.summary?.atRiskCount ?? 0
        if risk == "danger" || risk == "watch" {
            return "\(atRisk) в риске"
        }
        return "цели в норме"
    }

    var body: some View {
        WidgetChrome {
            content(theme: theme)
        }
        .widgetURL(URL(string: "journal-v://goals"))
    }

    @ViewBuilder
    private func content(theme: WidgetTheme) -> some View {
        if payload == nil || (totalSubjectsWithGoals == 0 && totalMarks == 0) {
            emptyState(theme: theme)
        } else {
            populated(theme: theme)
        }
    }

    // MARK: — Populated layout

    private func populated(theme: WidgetTheme) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            statsRow(theme: theme)
                .padding(.trailing, 50) // keep stats clear of the corner mark

            if totalMarks > 0 {
                distributionBar
                    .padding(.top, 2)
                gradesRow(theme: theme)
            }

            Spacer(minLength: 0)
            footer(theme: theme)
        }
    }

    // MARK: — Stats row (3 columns)

    private func statsRow(theme: WidgetTheme) -> some View {
        HStack(alignment: .top, spacing: 6) {
            statCell(
                value: payload?.avg.map { String(format: "%.1f", $0) } ?? "—",
                label: "средний балл",
                color: theme.primaryText,
                theme: theme
            )
            statCell(
                value: payload?.attendance.map { "\(Int($0.rounded()))%" } ?? "—",
                label: "посещаемость",
                color: GoalsPalette.grade4,
                theme: theme
            )
            statCell(
                value: "\(totalMarks)",
                label: "всего оценок",
                color: theme.primaryText,
                theme: theme
            )
        }
    }

    private func statCell(value: String, label: String, color: Color, theme: WidgetTheme) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundColor(color)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(theme.secondaryText)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: — Distribution bar

    private var distributionBar: some View {
        GeometryReader { geo in
            HStack(spacing: 0) {
                ForEach([5, 4, 3, 2, 1], id: \.self) { v in
                    let count = distributionCounts[v] ?? 0
                    if count > 0 {
                        let pct = CGFloat(count) / CGFloat(max(totalMarks, 1))
                        Rectangle()
                            .fill(GoalsPalette.color(for: v))
                            .frame(width: geo.size.width * pct)
                    }
                }
            }
        }
        .frame(height: 6)
        .clipShape(Capsule())
    }

    // MARK: — Grade tiles

    private func gradesRow(theme: WidgetTheme) -> some View {
        HStack(spacing: 4) {
            ForEach([5, 4, 3, 2, 1], id: \.self) { v in
                gradeTile(mark: v, theme: theme)
            }
        }
    }

    private func gradeTile(mark: Int, theme: WidgetTheme) -> some View {
        let count = distributionCounts[mark] ?? 0
        let pct: Int = totalMarks > 0
            ? Int((Double(count) / Double(totalMarks) * 100.0).rounded())
            : 0
        return VStack(spacing: 1) {
            Text("\(mark)")
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(GoalsPalette.color(for: mark))
                .lineLimit(1)
            Text("\(count)")
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(theme.primaryText)
                .lineLimit(1)
            Text("\(pct)%")
                .font(.system(size: 8))
                .foregroundColor(theme.secondaryText)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 4)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(GoalsPalette.background(for: mark))
        )
        .opacity(count == 0 ? 0.45 : 1)
    }

    // MARK: — Footer

    @ViewBuilder
    private func footer(theme: WidgetTheme) -> some View {
        if totalSubjectsWithGoals > 0 {
            HStack(alignment: .center, spacing: 6) {
                HStack(spacing: 4) {
                    Circle()
                        .fill(GoalsPalette.riskColor(risk))
                        .frame(width: 6, height: 6)
                    Text(badgeLabel)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(GoalsPalette.riskColor(risk))
                        .lineLimit(1)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(
                    Capsule().fill(GoalsPalette.riskBackground(risk))
                )

                Spacer(minLength: 4)

                forecastTargetLine(theme: theme)
            }
        }
    }

    private func forecastTargetLine(theme: WidgetTheme) -> some View {
        let forecast = payload?.summary?.forecast.map { String(format: "%.2f", $0) } ?? "—"
        let target = payload?.summary?.target.map { String(format: "%.2f", $0) } ?? "—"
        return (
            Text("прогноз ")
                .foregroundColor(theme.secondaryText)
            + Text(forecast)
                .foregroundColor(theme.primaryText)
                .fontWeight(.semibold)
            + Text(" · цель ")
                .foregroundColor(theme.secondaryText)
            + Text(target)
                .foregroundColor(theme.primaryText)
                .fontWeight(.semibold)
        )
        .font(.system(size: 10, design: .rounded))
        .lineLimit(1)
        .minimumScaleFactor(0.8)
    }

    // MARK: — Empty state

    private func emptyState(theme: WidgetTheme) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Spacer(minLength: 0)
            Text("Нет данных")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(theme.primaryText)
            Text("Откройте приложение")
                .font(.system(size: 11))
                .foregroundColor(theme.secondaryText)
            Spacer(minLength: 0)
        }
        .padding(.trailing, 50)
    }
}

// MARK: — Widget config

struct GoalsSummaryWidget: Widget {
    let kind: String = "GoalsSummaryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: GoalsSummaryProvider()) { entry in
            GoalsSummaryWidgetView(entry: entry)
        }
        .configurationDisplayName("Сводка оценок")
        .description("Средний балл, посещаемость и распределение оценок.")
        .supportedFamilies([.systemMedium])
    }
}
