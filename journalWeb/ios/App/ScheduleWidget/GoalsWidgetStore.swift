import Foundation

private let goalsAppGroupId = "group.com.Dikroll.Journal.shared"
private let goalsPayloadKey = "goals_payload"
// Web layer writes the JSON to Documents/widgets/goals-payload.json. The
// schedule widget mirrors a similar pattern for its own payload.
private let goalsPayloadFileName = "goals-payload.json"
private let goalsPayloadDirectory = "widgets"

struct GoalsPayload: Decodable {
    struct Distribution: Decodable {
        let one: Int
        let two: Int
        let three: Int
        let four: Int
        let five: Int

        enum CodingKeys: String, CodingKey {
            case one = "1"
            case two = "2"
            case three = "3"
            case four = "4"
            case five = "5"
        }

        init(from decoder: Decoder) throws {
            let c = try decoder.container(keyedBy: CodingKeys.self)
            self.one = (try? c.decodeIfPresent(Int.self, forKey: .one)) ?? 0
            self.two = (try? c.decodeIfPresent(Int.self, forKey: .two)) ?? 0
            self.three = (try? c.decodeIfPresent(Int.self, forKey: .three)) ?? 0
            self.four = (try? c.decodeIfPresent(Int.self, forKey: .four)) ?? 0
            self.five = (try? c.decodeIfPresent(Int.self, forKey: .five)) ?? 0
        }

        func count(for mark: Int) -> Int {
            switch mark {
            case 1: return one
            case 2: return two
            case 3: return three
            case 4: return four
            case 5: return five
            default: return 0
            }
        }
    }

    struct Summary: Decodable {
        let risk: String?
        let atRiskCount: Int?
        let totalSubjectsWithGoals: Int?
        let forecast: Double?
        let target: Double?
    }

    let generatedAt: String?
    let avg: Double?
    let attendance: Double?
    let totalMarks: Int?
    let distribution: Distribution?
    let summary: Summary?
}

struct GoalsLoadState {
    let payload: GoalsPayload?
}

enum GoalsWidgetStore {
    static func loadState() -> GoalsLoadState {
        let fileManager = FileManager.default
        let containerURL = fileManager.containerURL(
            forSecurityApplicationGroupIdentifier: goalsAppGroupId
        )

        if let containerURL = containerURL {
            // Primary: <appGroup>/widgets/goals-payload.json
            let nestedURL = containerURL
                .appendingPathComponent(goalsPayloadDirectory)
                .appendingPathComponent(goalsPayloadFileName)
            if fileManager.fileExists(atPath: nestedURL.path),
               let data = try? Data(contentsOf: nestedURL),
               let payload = try? JSONDecoder().decode(GoalsPayload.self, from: data) {
                return GoalsLoadState(payload: payload)
            }

            // Fallback: <appGroup>/goals-payload.json (flat)
            let flatURL = containerURL.appendingPathComponent(goalsPayloadFileName)
            if fileManager.fileExists(atPath: flatURL.path),
               let data = try? Data(contentsOf: flatURL),
               let payload = try? JSONDecoder().decode(GoalsPayload.self, from: data) {
                return GoalsLoadState(payload: payload)
            }
        }

        // Last-resort: a string blob in shared UserDefaults under `goals_payload`.
        if
            let defaults = UserDefaults(suiteName: goalsAppGroupId),
            let payloadString = defaults.string(forKey: goalsPayloadKey),
            let data = payloadString.data(using: .utf8),
            let decoded = try? JSONDecoder().decode(GoalsPayload.self, from: data)
        {
            return GoalsLoadState(payload: decoded)
        }

        return GoalsLoadState(payload: nil)
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
