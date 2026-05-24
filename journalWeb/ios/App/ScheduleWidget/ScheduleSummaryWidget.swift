import WidgetKit
import SwiftUI

struct ScheduleSummaryEntry: TimelineEntry {
    let date: Date
    let state: ScheduleLoadState
    let snapshot: TodaySnapshot
    let nextLessonStartDate: Date?
    let currentLessonEndDate: Date?
}

struct ScheduleSummaryProvider: TimelineProvider {
    func placeholder(in context: Context) -> ScheduleSummaryEntry {
        ScheduleSummaryEntry(
            date: Date(),
            state: ScheduleLoadState(payload: nil),
            snapshot: ScheduleWidgetSnapshotBuilder.build(payload: nil),
            nextLessonStartDate: nil,
            currentLessonEndDate: nil
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (ScheduleSummaryEntry) -> Void) {
        let state = ScheduleWidgetStore.loadState()
        let snap = ScheduleWidgetSnapshotBuilder.build(payload: state.payload)
        completion(
            ScheduleSummaryEntry(
                date: Date(),
                state: state,
                snapshot: snap,
                nextLessonStartDate: ScheduleWidgetStore.lessonStartDate(for: snap.nextLesson),
                currentLessonEndDate: ScheduleWidgetStore.lessonEndDate(for: snap.currentLesson)
            )
        )
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ScheduleSummaryEntry>) -> Void) {
        let state = ScheduleWidgetStore.loadState()
        let now = Date()

        var dates: [Date] = [now]
        dates.append(contentsOf: ScheduleTimelineHelpers.boundaryDates(
            payload: state.payload, now: now))

        let entries: [ScheduleSummaryEntry] = dates.map { entryDate in
            let snap = ScheduleWidgetSnapshotBuilder.build(
                payload: state.payload, now: entryDate)
            return ScheduleSummaryEntry(
                date: entryDate,
                state: state,
                snapshot: snap,
                nextLessonStartDate: ScheduleWidgetStore.lessonStartDate(
                    for: snap.nextLesson),
                currentLessonEndDate: ScheduleWidgetStore.lessonEndDate(
                    for: snap.currentLesson)
            )
        }

        let refresh = entries.last?.date.addingTimeInterval(60)
            ?? now.addingTimeInterval(1800)
        completion(Timeline(entries: entries, policy: .after(refresh)))
    }
}

struct ScheduleSummaryWidgetView: View {
    let entry: ScheduleSummaryEntry
    @Environment(\.colorScheme) private var colorScheme

    private var payload: SchedulePayload? { entry.state.payload }
    private var snapshot: TodaySnapshot { entry.snapshot }
    private var theme: WidgetTheme { WidgetTheme(isDark: colorScheme == .dark) }

    var body: some View {
        WidgetChrome {
            content(theme: theme)
        }
        .widgetURL(URL(string: "journal-v://schedule"))
    }

    @ViewBuilder
    private func content(theme: WidgetTheme) -> some View {
        if let current = snapshot.currentLesson {
            currentLessonBody(current: current, theme: theme)
        } else if let next = snapshot.nextLesson {
            nextLessonBody(next: next, theme: theme)
        } else if let tomorrow = snapshot.tomorrowFirstLesson {
            tomorrowBody(tomorrow: tomorrow, theme: theme)
        } else if snapshot.allLessonsCompleted {
            finishedTodayBody(theme: theme)
        } else if snapshot.isEmpty && payload != nil {
            weekendBody(theme: theme)
        } else {
            noDataBody(theme: theme)
        }
    }

    // MARK: — Current lesson in progress

    private func currentLessonBody(current: SchedulePayload.Lesson, theme: WidgetTheme) -> some View {
        let total = snapshot.totalCount
        let done = snapshot.completedCount
        return VStack(alignment: .leading, spacing: 0) {
            headerRow(
                leading: "СЕЙЧАС",
                accent: true,
                badgeText: total > 0 ? "\(done)/\(total)" : nil,
                theme: theme
            )

            Spacer(minLength: 0)

            if let endDate = entry.currentLessonEndDate, endDate > Date() {
                Text(timerInterval: Date()...endDate, countsDown: true)
                    .font(.system(size: 26, weight: .heavy, design: .rounded))
                    .foregroundColor(theme.primaryText)
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
            } else {
                Text("Идёт")
                    .font(.system(size: 26, weight: .heavy, design: .rounded))
                    .foregroundColor(theme.primaryText)
            }

            Text(current.subject)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(theme.primaryText.opacity(0.9))
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)

            if !current.room.isEmpty {
                Text("до \(current.finishedAt) · \(WidgetTextHelpers.shortRoom(current.room))")
                    .font(.system(size: 10))
                    .foregroundColor(theme.secondaryText)
                    .lineLimit(1)
            } else {
                Text("до \(current.finishedAt)")
                    .font(.system(size: 10))
                    .foregroundColor(theme.secondaryText)
                    .lineLimit(1)
            }

            Spacer(minLength: 0)
        }
    }

    // MARK: — Active day (there's a next lesson)

    private func nextLessonBody(next: SchedulePayload.Lesson, theme: WidgetTheme) -> some View {
        let total = snapshot.totalCount
        let done = snapshot.completedCount
        return VStack(alignment: .leading, spacing: 0) {
            headerRow(
                leading: "ДАЛЕЕ",
                accent: false,
                badgeText: total > 0 ? "\(done)/\(total)" : nil,
                theme: theme
            )

            Spacer(minLength: 0)

            Text(next.startedAt)
                .font(.system(size: 30, weight: .heavy, design: .rounded))
                .foregroundColor(theme.primaryText)
                .minimumScaleFactor(0.8)

            Text(next.subject)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(theme.primaryText.opacity(0.9))
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)

            if !next.room.isEmpty {
                Text(WidgetTextHelpers.shortRoom(next.room))
                    .font(.system(size: 11))
                    .foregroundColor(theme.secondaryText)
                    .lineLimit(1)
            }

            Spacer(minLength: 0)

            if let nextStart = entry.nextLessonStartDate, nextStart > Date() {
                Text(timerInterval: Date()...nextStart, countsDown: true)
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(theme.brandSoft)
                    .lineLimit(1)
            }
        }
    }

    // MARK: — Day finished, show tomorrow

    private func tomorrowBody(tomorrow: SchedulePayload.Lesson, theme: WidgetTheme) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            headerRow(
                leading: snapshot.upcomingDayLabel ?? "ЗАВТРА",
                accent: false,
                badgeText: nil,
                theme: theme
            )

            Spacer(minLength: 0)

            Text(tomorrow.startedAt)
                .font(.system(size: 30, weight: .heavy, design: .rounded))
                .foregroundColor(theme.primaryText)
                .minimumScaleFactor(0.8)

            Text(tomorrow.subject)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(theme.primaryText.opacity(0.9))
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)

            if !tomorrow.room.isEmpty {
                Text(WidgetTextHelpers.shortRoom(tomorrow.room))
                    .font(.system(size: 11))
                    .foregroundColor(theme.secondaryText)
                    .lineLimit(1)
            }

            Spacer(minLength: 0)

            Text("Готово")
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(theme.tertiaryText)
        }
    }

    // MARK: — All today's lessons completed (no upcoming day data yet)

    private func finishedTodayBody(theme: WidgetTheme) -> some View {
        let total = snapshot.totalCount
        let done = snapshot.completedCount
        return VStack(alignment: .leading, spacing: 0) {
            headerRow(
                leading: "СЕГОДНЯ",
                accent: false,
                badgeText: total > 0 ? "\(done)/\(total)" : nil,
                theme: theme
            )

            Spacer(minLength: 0)

            Text("Готово")
                .font(.system(size: 30, weight: .heavy, design: .rounded))
                .foregroundColor(theme.primaryText)

            Text("Пары закончились")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(theme.primaryText.opacity(0.85))
                .lineLimit(1)

            Spacer(minLength: 0)
        }
    }

    // MARK: — Weekend / empty day

    private func weekendBody(theme: WidgetTheme) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            headerRow(leading: "СЕГОДНЯ", accent: false, badgeText: nil, theme: theme)
            Spacer(minLength: 0)
            Text("Выходной")
                .font(.system(size: 22, weight: .heavy))
                .foregroundColor(theme.primaryText)
            Text("Пар нет, можно выдохнуть")
                .font(.system(size: 12))
                .foregroundColor(theme.secondaryText)
                .lineLimit(2)
            Spacer(minLength: 0)
        }
    }

    private func noDataBody(theme: WidgetTheme) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            headerRow(leading: "СЕГОДНЯ", accent: false, badgeText: nil, theme: theme)
            Spacer(minLength: 0)
            Text("Нет данных")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(theme.primaryText)
            Text("Откройте приложение")
                .font(.system(size: 11))
                .foregroundColor(theme.secondaryText)
            Spacer(minLength: 0)
        }
    }

    // MARK: — Shared header

    private func headerRow(leading: String, accent: Bool, badgeText: String?, theme: WidgetTheme) -> some View {
        HStack(alignment: .center, spacing: 6) {
            Text(leading)
                .font(.system(size: 10, weight: .bold))
                .tracking(0.6)
                .foregroundColor(accent ? theme.brandSoft : theme.secondaryText)
                .lineLimit(1)
                .fixedSize(horizontal: true, vertical: false)
                .layoutPriority(2)
            if let badgeText = badgeText {
                Text(badgeText)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(theme.primaryText)
                    .lineLimit(1)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(
                        Capsule().fill(theme.primaryText.opacity(0.12))
                    )
                    .fixedSize()
            }
            Spacer(minLength: 0)
        }
        .padding(.trailing, 40)
    }
}

struct ScheduleSummaryWidget: Widget {
    let kind: String = "ScheduleSummaryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ScheduleSummaryProvider()) { entry in
            ScheduleSummaryWidgetView(entry: entry)
        }
        .configurationDisplayName("Сводка дня")
        .description("Ближайшая пара, статус «сейчас» и таймер.")
        .supportedFamilies([.systemSmall])
    }
}
