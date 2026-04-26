import WidgetKit
import SwiftUI

private let appGroupId = "group.com.Dikroll.Journal.shared"
private let payloadKey = "schedule_payload"
private let payloadFileName = "schedule_payload.json"

struct SchedulePayload: Decodable {
    struct Lesson: Decodable, Identifiable {
        let lesson: Int
        let subject: String
        let room: String
        let teacher: String
        let startedAt: String
        let finishedAt: String
        let date: String

        var id: String { "\(date)-\(lesson)" }
    }

    struct Stats: Decodable {
        let averageGrade: Double?
        let attendancePercent: Double?
        let totalMarks: Int?
    }

    let date: String
    let savedAt: Int?
    let summary: String?
    let isEmpty: Bool
    let nextLesson: Lesson?
    let lessons: [Lesson]
    let tomorrowFirstLesson: Lesson?
    let completedCount: Int?
    let totalCount: Int?
    let stats: Stats?
    let weeklyLessons: [String: [Lesson]]?
}

// Computed snapshot for "today" derived at render time from weeklyLessons.
struct TodaySnapshot {
    let lessons: [SchedulePayload.Lesson]
    let nextLesson: SchedulePayload.Lesson?
    let currentLesson: SchedulePayload.Lesson?
    let tomorrowFirstLesson: SchedulePayload.Lesson?
    let upcomingDayLabel: String? // "ЗАВТРА", "В ПОНЕДЕЛЬНИК", etc.
    let completedCount: Int
    let totalCount: Int
    let isEmpty: Bool
    let allLessonsCompleted: Bool
}

enum ScheduleWidgetSnapshotBuilder {
    static func isoDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone.current
        return formatter.string(from: date)
    }

    static func minutes(from time: String) -> Int? {
        let parts = time.split(separator: ":").compactMap { Int($0) }
        guard parts.count >= 2 else { return nil }
        return parts[0] * 60 + parts[1]
    }

    static func build(payload: SchedulePayload?, now: Date = Date()) -> TodaySnapshot {
        guard let payload = payload else {
            return TodaySnapshot(
                lessons: [], nextLesson: nil, currentLesson: nil,
                tomorrowFirstLesson: nil, upcomingDayLabel: nil,
                completedCount: 0, totalCount: 0,
                isEmpty: true, allLessonsCompleted: false
            )
        }

        let todayKey = isoDate(now)

        let todayLessons: [SchedulePayload.Lesson] = {
            if let weekly = payload.weeklyLessons, let arr = weekly[todayKey] {
                return arr.sorted { $0.lesson < $1.lesson }
            }
            if payload.date == todayKey {
                return payload.lessons.sorted { $0.lesson < $1.lesson }
            }
            return []
        }()

        // Look ahead up to 7 days for the next school day with lessons.
        let (upcomingFirst, upcomingDate): (SchedulePayload.Lesson?, Date?) = {
            for offset in 1...7 {
                let candidate = now.addingTimeInterval(TimeInterval(86_400 * offset))
                let key = isoDate(candidate)
                if let weekly = payload.weeklyLessons,
                   let arr = weekly[key], !arr.isEmpty {
                    return (arr.sorted { $0.lesson < $1.lesson }.first, candidate)
                }
                if offset == 1,
                   let legacy = payload.tomorrowFirstLesson,
                   legacy.date == key {
                    return (legacy, candidate)
                }
            }
            return (nil, nil)
        }()
        let upcomingLabel: String? = {
            guard let date = upcomingDate else { return nil }
            let cal = Calendar.current
            let days = cal.dateComponents([.day], from: cal.startOfDay(for: now),
                                          to: cal.startOfDay(for: date)).day ?? 0
            if days == 1 { return "ЗАВТРА" }
            let formatter = DateFormatter()
            formatter.locale = Locale(identifier: "ru_RU")
            formatter.dateFormat = "EEEE"
            return ("В " + formatter.string(from: date)).uppercased()
        }()

        let nowMin: Int = {
            let cal = Calendar.current
            let h = cal.component(.hour, from: now)
            let m = cal.component(.minute, from: now)
            return h * 60 + m
        }()

        var completed = 0
        var nextLesson: SchedulePayload.Lesson? = nil
        var currentLesson: SchedulePayload.Lesson? = nil
        for lesson in todayLessons {
            guard let endMin = minutes(from: lesson.finishedAt),
                  let startMin = minutes(from: lesson.startedAt) else { continue }
            if endMin <= nowMin { completed += 1 }
            if currentLesson == nil, nowMin >= startMin && nowMin <= endMin {
                currentLesson = lesson
            }
            if nextLesson == nil, startMin > nowMin {
                nextLesson = lesson
            }
        }

        let allDone = !todayLessons.isEmpty
            && currentLesson == nil
            && nextLesson == nil

        return TodaySnapshot(
            lessons: todayLessons,
            nextLesson: nextLesson,
            currentLesson: currentLesson,
            tomorrowFirstLesson: upcomingFirst,
            upcomingDayLabel: upcomingLabel,
            completedCount: completed,
            totalCount: todayLessons.count,
            isEmpty: todayLessons.isEmpty,
            allLessonsCompleted: allDone
        )
    }

    static func nextMidnight(after date: Date) -> Date {
        let cal = Calendar.current
        var components = cal.dateComponents([.year, .month, .day], from: date)
        components.day = (components.day ?? 0) + 1
        components.hour = 0
        components.minute = 1
        return cal.date(from: components) ?? date.addingTimeInterval(3600)
    }
}

struct ScheduleLoadState {
    let payload: SchedulePayload?
}

struct ScheduleListEntry: TimelineEntry {
    let date: Date
    let state: ScheduleLoadState
}

enum ScheduleWidgetStore {
    static func loadState() -> ScheduleLoadState {
        let fileManager = FileManager.default
        let containerURL = fileManager.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupId
        )

        if let containerURL = containerURL {
            let fileURL = containerURL.appendingPathComponent(payloadFileName)
            if fileManager.fileExists(atPath: fileURL.path),
               let data = try? Data(contentsOf: fileURL),
               let payload = try? JSONDecoder().decode(SchedulePayload.self, from: data) {
                return ScheduleLoadState(payload: payload)
            }
        }

        if
            let defaults = UserDefaults(suiteName: appGroupId),
            let payload = defaults.string(forKey: payloadKey),
            let data = payload.data(using: .utf8),
            let decoded = try? JSONDecoder().decode(SchedulePayload.self, from: data)
        {
            return ScheduleLoadState(payload: decoded)
        }

        return ScheduleLoadState(payload: nil)
    }

    static func lessonStartDate(for lesson: SchedulePayload.Lesson?) -> Date? {
        guard let lesson = lesson else { return nil }
        return makeDate(date: lesson.date, time: lesson.startedAt)
    }

    static func lessonEndDate(for lesson: SchedulePayload.Lesson?) -> Date? {
        guard let lesson = lesson else { return nil }
        return makeDate(date: lesson.date, time: lesson.finishedAt)
    }

    private static func makeDate(date: String, time: String) -> Date? {
        let dateParts = date.split(separator: "-").compactMap { Int($0) }
        let timeParts = time.split(separator: ":").compactMap { Int($0) }
        guard dateParts.count == 3, timeParts.count >= 2 else { return nil }

        var components = DateComponents()
        components.year = dateParts[0]
        components.month = dateParts[1]
        components.day = dateParts[2]
        components.hour = timeParts[0]
        components.minute = timeParts[1]
        return Calendar.current.date(from: components)
    }
}

struct ScheduleListProvider: TimelineProvider {
    func placeholder(in context: Context) -> ScheduleListEntry {
        ScheduleListEntry(date: Date(), state: ScheduleLoadState(payload: nil))
    }

    func getSnapshot(in context: Context, completion: @escaping (ScheduleListEntry) -> Void) {
        completion(ScheduleListEntry(date: Date(), state: ScheduleWidgetStore.loadState()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ScheduleListEntry>) -> Void) {
        let now = Date()
        let entry = ScheduleListEntry(date: now, state: ScheduleWidgetStore.loadState())
        let nextRefresh = min(
            now.addingTimeInterval(30 * 60),
            ScheduleWidgetSnapshotBuilder.nextMidnight(after: now)
        )
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }
}

// MARK: — Logo corner mark

// Logo-inspired red corner mark: two perpendicular bars meeting at a rounded
// outer top-right corner, with rounded caps on the inner ends and a generous
// inner concave radius so the corner doesn't look cramped.
struct LogoCornerMark: Shape {
    let thickness: CGFloat
    let outerRadius: CGFloat

    func path(in rect: CGRect) -> Path {
        var p = Path()
        let w = rect.width
        let h = rect.height
        let r = min(outerRadius, min(w, h) / 2)
        let t = min(thickness, r)
        let innerR = max(r - t, 0)
        let cap = t / 2

        // Top edge — start past the rounded cap on the left.
        p.move(to: CGPoint(x: cap, y: 0))
        p.addLine(to: CGPoint(x: w - r, y: 0))
        // Outer top-right corner.
        p.addArc(
            center: CGPoint(x: w - r, y: r),
            radius: r,
            startAngle: .degrees(-90),
            endAngle: .degrees(0),
            clockwise: false
        )
        // Right edge going down to before the bottom cap.
        p.addLine(to: CGPoint(x: w, y: h - cap))
        // Bottom-right rounded cap (right → bottom → left).
        p.addArc(
            center: CGPoint(x: w - cap, y: h - cap),
            radius: cap,
            startAngle: .degrees(0),
            endAngle: .degrees(180),
            clockwise: false
        )
        // Inside of right vertical bar going up.
        p.addLine(to: CGPoint(x: w - t, y: r))
        // Inner concave corner (going right → top inside the L).
        if innerR > 0 {
            p.addArc(
                center: CGPoint(x: w - r, y: r),
                radius: innerR,
                startAngle: .degrees(0),
                endAngle: .degrees(-90),
                clockwise: true
            )
        }
        // Bottom of the top horizontal bar going left.
        p.addLine(to: CGPoint(x: cap, y: t))
        // Top-left rounded cap (bottom → left → top).
        p.addArc(
            center: CGPoint(x: cap, y: cap),
            radius: cap,
            startAngle: .degrees(90),
            endAngle: .degrees(270),
            clockwise: true
        )
        p.closeSubpath()
        return p
    }
}

// MARK: — Theme + chrome

struct WidgetTheme {
    let isDark: Bool

    var brandColor: Color {
        isDark
            ? Color(red: 0.980, green: 0.155, blue: 0.155) // #fa2727
            : Color(red: 0.835, green: 0.016, blue: 0.086) // #d50416
    }

    var brandSoft: Color {
        isDark
            ? Color(red: 0.980, green: 0.420, blue: 0.420)
            : Color(red: 0.835, green: 0.016, blue: 0.086)
    }

    var primaryText: Color { isDark ? .white : Color(red: 0.10, green: 0.10, blue: 0.10) }
    var secondaryText: Color { primaryText.opacity(isDark ? 0.55 : 0.55) }
    var tertiaryText: Color { primaryText.opacity(isDark ? 0.40 : 0.42) }
    var dimText: Color { primaryText.opacity(isDark ? 0.50 : 0.50) }
    var rowHighlight: Color { primaryText.opacity(isDark ? 0.08 : 0.06) }
    var rowDivider: Color { primaryText.opacity(isDark ? 0.12 : 0.12) }

    var background: LinearGradient {
        isDark
            ? LinearGradient(
                colors: [
                    Color(red: 0.090, green: 0.103, blue: 0.114),
                    Color(red: 0.066, green: 0.074, blue: 0.103)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            : LinearGradient(
                colors: [
                    Color(red: 1.000, green: 1.000, blue: 1.000),
                    Color(red: 0.984, green: 0.972, blue: 0.961)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
    }

    var warmGlow: some View {
        RadialGradient(
            colors: [
                brandColor.opacity(isDark ? 0.10 : 0.07),
                .clear
            ],
            center: UnitPoint(x: 0.0, y: 1.1),
            startRadius: 0,
            endRadius: 320
        )
    }
}

struct WidgetChrome<Content: View>: View {
    let content: Content
    @Environment(\.colorScheme) private var colorScheme

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    private var theme: WidgetTheme {
        WidgetTheme(isDark: colorScheme == .dark)
    }

    private var cornerMark: some View {
        LogoCornerMark(thickness: 6, outerRadius: 22)
            .fill(theme.brandColor)
            .frame(width: 48, height: 48)
            .accessibilityHidden(true)
    }

    var body: some View {
        let theme = self.theme
        if #available(iOSApplicationExtension 17.0, *) {
            ZStack(alignment: .topTrailing) {
                content
                    .padding(.horizontal, 10)
                    .padding(.vertical, 10)
                cornerMark
                    .offset(x: 0, y: 0)
            }
            .ignoresSafeArea()
            .containerBackground(for: .widget) {
                ZStack {
                    theme.background
                    theme.warmGlow
                }
            }
            .environment(\.widgetTheme, theme)
        } else {
            ZStack(alignment: .topTrailing) {
                theme.background
                theme.warmGlow
                content
                    .padding(.horizontal, 10)
                    .padding(.vertical, 10)
                cornerMark
                    .offset(x: 0, y: 0)
            }
            .ignoresSafeArea()
            .environment(\.widgetTheme, theme)
        }
    }
}

private struct WidgetThemeKey: EnvironmentKey {
    static let defaultValue = WidgetTheme(isDark: true)
}

extension EnvironmentValues {
    var widgetTheme: WidgetTheme {
        get { self[WidgetThemeKey.self] }
        set { self[WidgetThemeKey.self] = newValue }
    }
}

// MARK: — Helpers

enum WidgetTextHelpers {
    /// Strips parenthetical "(…)" suffix from a room string so long values like
    /// "АУ 8 (5 этаж)" collapse to "АУ 8" for tight widget rows.
    static func shortRoom(_ room: String) -> String {
        guard let openParen = room.firstIndex(of: "(") else { return room }
        return String(room[room.startIndex..<openParen]).trimmingCharacters(in: .whitespaces)
    }
}

// MARK: — List widget rows

struct LessonRow: View {
    let lesson: SchedulePayload.Lesson
    let isCurrent: Bool
    @Environment(\.widgetTheme) private var theme

    var body: some View {
        HStack(alignment: .center, spacing: 9) {
            Text(lesson.startedAt)
                .font(.system(size: 11, weight: isCurrent ? .bold : .semibold, design: .rounded))
                .foregroundColor(isCurrent ? theme.brandSoft : theme.primaryText)
                .frame(width: 42, alignment: .leading)

            Rectangle()
                .fill(isCurrent ? theme.brandSoft : theme.rowDivider)
                .frame(width: 2.5, height: 16)
                .clipShape(Capsule())

            Text(lesson.subject)
                .font(.system(size: 11.5, weight: isCurrent ? .bold : .medium))
                .foregroundColor(isCurrent ? theme.primaryText : theme.primaryText.opacity(0.82))
                .lineLimit(1)
                .truncationMode(.tail)
                .frame(maxWidth: .infinity, alignment: .leading)

            if !lesson.room.isEmpty {
                Text(WidgetTextHelpers.shortRoom(lesson.room))
                    .font(.system(size: 9.5, weight: .medium))
                    .foregroundColor(theme.tertiaryText)
                    .lineLimit(1)
            }
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 4)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(isCurrent ? theme.rowHighlight : .clear)
        )
    }
}

struct ScheduleListWidgetView: View {
    @Environment(\.widgetFamily) private var family
    @Environment(\.colorScheme) private var colorScheme
    let entry: ScheduleListEntry

    private var payload: SchedulePayload? { entry.state.payload }
    private var snapshot: TodaySnapshot {
        ScheduleWidgetSnapshotBuilder.build(payload: payload)
    }

    private var maxLessons: Int {
        family == .systemLarge ? 7 : 4
    }

    /// Visible lessons: start at the current lesson if there is one, otherwise
    /// drop completed lessons so the user only sees what's still ahead today.
    private var visibleLessons: [SchedulePayload.Lesson] {
        let lessons = snapshot.lessons
        if let current = snapshot.currentLesson, let idx = lessons.firstIndex(where: { $0.id == current.id }) {
            return Array(lessons[idx...])
        }
        if let next = snapshot.nextLesson, let idx = lessons.firstIndex(where: { $0.id == next.id }) {
            return Array(lessons[idx...])
        }
        return lessons.filter { lesson in
            guard let endMin = ScheduleWidgetSnapshotBuilder.minutes(from: lesson.finishedAt) else { return true }
            let now = Date()
            let cal = Calendar.current
            let nowMin = cal.component(.hour, from: now) * 60 + cal.component(.minute, from: now)
            return endMin > nowMin
        }
    }

    var body: some View {
        let snap = snapshot
        return WidgetChrome {
            VStack(alignment: .leading, spacing: 6) {
                headerView(snap: snap)

                if !snap.lessons.isEmpty {
                    let visible = visibleLessons
                    let shown = Array(visible.prefix(maxLessons))
                    let remaining = visible.count - shown.count
                    VStack(alignment: .leading, spacing: 1) {
                        ForEach(shown) { lesson in
                            LessonRow(
                                lesson: lesson,
                                isCurrent: lesson.id == snap.currentLesson?.id
                            )
                        }
                        if remaining > 0 {
                            HStack {
                                Spacer()
                                Text("+\(remaining) ещё")
                                    .font(.system(size: 10, weight: .semibold))
                                    .foregroundColor(themedColor(.tertiary))
                                    .padding(.top, 2)
                            }
                        }
                    }
                    Spacer(minLength: 0)
                } else {
                    emptyBody(snap: snap)
                }
            }
            .padding(.top, 2)
            .padding(.trailing, 4) // breathing room next to the corner mark
        }
        .widgetURL(URL(string: "journal-v://schedule"))
    }

    private enum TextRole { case primary, secondary, tertiary }

    private func themedColor(_ role: TextRole) -> Color {
        let theme = WidgetTheme(isDark: colorScheme == .dark)
        switch role {
        case .primary: return theme.primaryText
        case .secondary: return theme.secondaryText
        case .tertiary: return theme.tertiaryText
        }
    }

    private func headerView(snap: TodaySnapshot) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 8) {
            Text(headerTitle(snap: snap))
                .font(.system(size: 10, weight: .bold))
                .tracking(0.6)
                .foregroundColor(themedColor(.secondary))
            Spacer()
            if let badgeText = badgeText(snap: snap) {
                Text(badgeText)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(themedColor(.primary))
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(
                        Capsule().fill(themedColor(.primary).opacity(colorScheme == .dark ? 0.12 : 0.06))
                    )
            }
        }
        .padding(.trailing, 54) // keep header clear of the corner mark
    }

    private func headerTitle(snap: TodaySnapshot) -> String {
        if snap.lessons.isEmpty {
            if snap.tomorrowFirstLesson != nil { return snap.upcomingDayLabel ?? "ЗАВТРА" }
            return "ВЫХОДНОЙ"
        }
        if snap.currentLesson == nil && snap.nextLesson == nil {
            return snap.tomorrowFirstLesson != nil
                ? (snap.upcomingDayLabel ?? "ЗАВТРА")
                : "СЕГОДНЯ"
        }
        return "СЕГОДНЯ"
    }

    private func badgeText(snap: TodaySnapshot) -> String? {
        if snap.totalCount == 0 { return nil }
        return "\(snap.completedCount)/\(snap.totalCount)"
    }

    @ViewBuilder
    private func emptyBody(snap: TodaySnapshot) -> some View {
        Spacer(minLength: 0)
        if let tomorrow = snap.tomorrowFirstLesson {
            VStack(alignment: .leading, spacing: 4) {
                Text(tomorrow.startedAt)
                    .font(.system(size: 28, weight: .heavy, design: .rounded))
                    .foregroundColor(themedColor(.primary))
                Text(tomorrow.subject)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(themedColor(.primary).opacity(0.88))
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
                if !tomorrow.room.isEmpty {
                    Text(WidgetTextHelpers.shortRoom(tomorrow.room))
                        .font(.system(size: 11))
                        .foregroundColor(themedColor(.secondary))
                }
                Text("Сегодня пары закончились")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(themedColor(.tertiary))
                    .padding(.top, 2)
            }
        } else if snap.allLessonsCompleted {
            VStack(alignment: .leading, spacing: 4) {
                Text("Готово")
                    .font(.system(size: 22, weight: .heavy))
                    .foregroundColor(themedColor(.primary))
                Text("Пары на сегодня закончились")
                    .font(.system(size: 12))
                    .foregroundColor(themedColor(.secondary))
                    .lineLimit(2)
            }
        } else if snap.lessons.isEmpty {
            VStack(alignment: .leading, spacing: 4) {
                Text("Выходной")
                    .font(.system(size: 22, weight: .heavy))
                    .foregroundColor(themedColor(.primary))
                Text("Можно выдохнуть")
                    .font(.system(size: 12))
                    .foregroundColor(themedColor(.secondary))
            }
        } else {
            VStack(alignment: .leading, spacing: 4) {
                Text("Нет данных")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(themedColor(.primary))
                Text("Откройте приложение")
                    .font(.system(size: 11))
                    .foregroundColor(themedColor(.secondary))
            }
        }
        Spacer(minLength: 0)
    }
}

struct ScheduleWidget: Widget {
    let kind: String = "ScheduleWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ScheduleListProvider()) { entry in
            ScheduleListWidgetView(entry: entry)
        }
        .configurationDisplayName("Расписание")
        .description("Все пары на сегодня.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}
